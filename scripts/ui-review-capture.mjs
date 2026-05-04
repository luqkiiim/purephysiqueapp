import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const host = process.env.UI_REVIEW_HOST ?? "127.0.0.1";
const port = Number(process.env.UI_REVIEW_PORT ?? 3107);
const providedBaseUrl = process.env.UI_REVIEW_BASE_URL;
const baseUrl = providedBaseUrl ?? `http://${host}:${port}`;
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const artifactRoot = path.join(process.cwd(), "artifacts", "ui-review", timestamp);
const screenshotDir = path.join(artifactRoot, "screenshots");
const summaryPath = path.join(artifactRoot, "summary.json");
const shouldStartServer = !providedBaseUrl;

const routes = [
  { name: "home", path: "/" },
  { name: "client-check-in", path: "/client" },
  { name: "client-history", path: "/client/history" },
  { name: "client-weekly", path: "/client/weekly" },
  { name: "client-photos", path: "/client/photos" },
  { name: "client-messages", path: "/client/messages" },
  { name: "coach-overview", path: "/coach", expectedCoachTabIndex: 0 },
  { name: "coach-clients", path: "/coach/clients", expectedCoachTabIndex: 1 },
  { name: "coach-review", path: "/coach/review", expectedCoachTabIndex: 2 },
  { name: "coach-settings", path: "/coach/settings" },
  { name: "coach-client-detail", path: "/coach/clients/client_ava" },
];

const viewports = [
  {
    name: "mobile-390",
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "mobile-430",
    width: 430,
    height: 932,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "desktop-1440",
    width: 1440,
    height: 1000,
    isMobile: false,
    hasTouch: false,
  },
];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForServer(url, timeoutMs = 60000) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });

      if (response.status > 0) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await sleep(750);
  }

  throw new Error(
    `Timed out waiting for ${url}${lastError ? `: ${lastError.message}` : ""}`,
  );
}

function startDemoServer() {
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", `npm.cmd run dev -- --hostname ${host} --port ${port}`]
      : ["run", "dev", "--", "--hostname", host, "--port", String(port)];
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_PUBLIC_APP_URL: baseUrl,
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  let isStopping = false;

  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });

  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  child.on("exit", (code) => {
    if (!isStopping && code !== null && code !== 0) {
      console.error(output.trim());
    }
  });

  return {
    child,
    getOutput: () => output,
    markStopping: () => {
      isStopping = true;
    },
  };
}

async function stopServer(server) {
  const child = server?.child;

  if (!child || child.exitCode !== null) {
    return;
  }

  server.markStopping();

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn(
        "taskkill",
        ["/pid", String(child.pid), "/T", "/F"],
        { stdio: "ignore" },
      );
      killer.on("close", resolve);
    });
    return;
  }

  child.kill("SIGTERM");
}

function toFilename(value) {
  return value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

function shouldIgnoreConsoleMessage(message) {
  return message.includes("The width(0) and height(0) of chart should be greater than 0");
}

async function readCoachTabState(page) {
  return page.evaluate(() => {
    const coachTabsViewport = document.querySelector("[data-coach-tab-viewport='true']");
    const coachPanels = coachTabsViewport
      ? [...coachTabsViewport.querySelectorAll(":scope > [data-coach-tab-panel='true']")]
      : [];
    const activeCoachPanel = coachPanels.find(
      (panel) => panel.getAttribute("aria-hidden") !== "true",
    );

    return {
      path: window.location.pathname,
      activePanelIndex: coachPanels.findIndex(
        (panel) => panel.getAttribute("aria-hidden") !== "true",
      ),
      viewportHeight: coachTabsViewport
        ? Math.round(coachTabsViewport.getBoundingClientRect().height)
        : null,
      activePanelHeight: activeCoachPanel ? Math.round(activeCoachPanel.scrollHeight) : null,
    };
  });
}

function isCoachTabHeightTooShort(state) {
  return (
    state.viewportHeight !== null &&
    state.activePanelHeight !== null &&
    state.viewportHeight + 2 < state.activePanelHeight
  );
}

async function swipeLeft(page, startX = 348, endX = 38, y = 590) {
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(460);
}

async function runCoachTabInteractionChecks(browser) {
  const context = await browser.newContext({
    viewport: {
      width: 390,
      height: 844,
    },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const checks = [];

  async function recordCheck(name, expectedPath, expectedPanelIndex) {
    const state = await readCoachTabState(page);
    const passed =
      state.path === expectedPath &&
      state.activePanelIndex === expectedPanelIndex &&
      !isCoachTabHeightTooShort(state);

    checks.push({
      name,
      expectedPath,
      expectedPanelIndex,
      passed,
      state,
    });
  }

  try {
    await page.goto(`${baseUrl}/coach`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.waitForTimeout(500);
    await recordCheck("direct-load-overview", "/coach", 0);

    await page.locator("nav[aria-label='Coach navigation'] a[aria-label='Review']").click();
    await page.waitForTimeout(460);
    await recordCheck("bottom-tab-review", "/coach/review", 2);

    await page.goBack();
    await page.waitForTimeout(460);
    await recordCheck("browser-back-overview", "/coach", 0);

    await swipeLeft(page);
    await recordCheck("swipe-overview-to-clients", "/coach/clients", 1);

    await swipeLeft(page, 360, 16);
    await recordCheck("strong-swipe-moves-one-tab", "/coach/review", 2);

    await swipeLeft(page, 360, 16);
    await recordCheck("edge-swipe-stays-on-review", "/coach/review", 2);
  } finally {
    await page.close();
    await context.close();
  }

  return checks;
}

async function collectDiagnostics(page, route, viewport) {
  return page.evaluate(
    ({ route, viewport }) => {
      const doc = document.documentElement;
      const body = document.body;
      const viewportWidth = doc.clientWidth;
      const viewportHeight = window.innerHeight;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const scrollHeight = Math.max(doc.scrollHeight, body.scrollHeight);
      const fixedCoachNav = document.querySelector("nav[aria-label='Coach navigation']");
      const coachTabsViewport = document.querySelector("[data-coach-tab-viewport='true']");
      const coachPanels = coachTabsViewport
        ? [...coachTabsViewport.querySelectorAll(":scope > [data-coach-tab-panel='true']")]
        : [];
      const activeCoachPanel = coachPanels.find(
        (panel) => panel.getAttribute("aria-hidden") !== "true",
      );
      const activeCoachPanelHeight = activeCoachPanel
        ? Math.round(activeCoachPanel.scrollHeight)
        : null;
      const coachTabsViewportHeight = coachTabsViewport
        ? Math.round(coachTabsViewport.getBoundingClientRect().height)
        : null;

      const clippedTextCandidates = [...document.querySelectorAll("h1,h2,h3,p,a,button,span,label")]
        .filter((element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          if (
            rect.width <= 0 ||
            rect.height <= 0 ||
            element.closest(".sr-only,[aria-hidden='true'],[inert]") ||
            style.visibility === "hidden" ||
            style.display === "none"
          ) {
            return false;
          }

          const clipsX = element.scrollWidth > element.clientWidth + 2;
          const clipsY = element.scrollHeight > element.clientHeight + 2;
          const overflowClips =
            ["hidden", "clip", "scroll", "auto"].includes(style.overflowX) ||
            ["hidden", "clip", "scroll", "auto"].includes(style.overflowY);

          return overflowClips && (clipsX || clipsY);
        })
        .slice(0, 20)
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          text: (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 120),
          className: element.getAttribute("class") ?? "",
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          clientHeight: element.clientHeight,
          scrollHeight: element.scrollHeight,
        }));

      let bottomNavOverlap = null;

      if (fixedCoachNav) {
        const navRect = fixedCoachNav.getBoundingClientRect();
        const bottomElements = [...document.querySelectorAll("main,section,div,form")]
          .map((element) => element.getBoundingClientRect())
          .filter((rect) => rect.width > 0 && rect.height > 0)
          .filter((rect) => rect.bottom > navRect.top && rect.top < navRect.bottom)
          .length;

        bottomNavOverlap = {
          navTop: Math.round(navRect.top),
          navHeight: Math.round(navRect.height),
          intersectingBlocks: bottomElements,
        };
      }

      return {
        route,
        viewport,
        finalPath: window.location.pathname,
        title: document.title,
        bodyTextStart: body.innerText.trim().replace(/\s+/g, " ").slice(0, 180),
        viewportWidth,
        viewportHeight,
        scrollWidth,
        scrollHeight,
        hasHorizontalOverflow: scrollWidth > viewportWidth + 1,
        clippedTextCandidates,
        bottomNavOverlap,
        coachTabs: coachTabsViewport
          ? {
              viewportHeight: coachTabsViewportHeight,
              activePanelHeight: activeCoachPanelHeight,
              activePanelIndex: coachPanels.findIndex(
                (panel) => panel.getAttribute("aria-hidden") !== "true",
              ),
              maxPanelHeight: Math.max(
                ...coachPanels.map((panel) => Math.round(panel.scrollHeight)),
              ),
            }
          : null,
      };
    },
    { route, viewport },
  );
}

async function runReview() {
  await fs.mkdir(screenshotDir, { recursive: true });

  let server = null;

  try {
    if (shouldStartServer) {
      server = startDemoServer();
      await waitForServer(baseUrl);
    } else {
      await waitForServer(baseUrl);
    }

    const browser = await chromium.launch({ headless: true });
    const summary = {
      baseUrl,
      artifactRoot,
      startedDemoServer: shouldStartServer,
      generatedAt: new Date().toISOString(),
      results: [],
      interactionChecks: [],
    };

    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: {
          width: viewport.width,
          height: viewport.height,
        },
        isMobile: viewport.isMobile,
        hasTouch: viewport.hasTouch,
      });

      for (const route of routes) {
        const page = await context.newPage();
        const consoleMessages = [];

        page.on("console", (message) => {
          if (
            ["error", "warning"].includes(message.type()) &&
            !shouldIgnoreConsoleMessage(message.text())
          ) {
            consoleMessages.push({
              type: message.type(),
              text: message.text().slice(0, 300),
            });
          }
        });

        const response = await page.goto(`${baseUrl}${route.path}`, {
          waitUntil: "networkidle",
          timeout: 60000,
        });

        await page.waitForTimeout(450);

        const screenshotName = `${viewport.name}-${toFilename(route.name)}.png`;
        const screenshotPath = path.join(screenshotDir, screenshotName);
        const viewportScreenshotName = `${viewport.name}-${toFilename(route.name)}-viewport.png`;
        const viewportScreenshotPath = path.join(screenshotDir, viewportScreenshotName);

        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
        await page.screenshot({
          path: viewportScreenshotPath,
          fullPage: false,
        });

        const diagnostics = await collectDiagnostics(page, route, viewport);

        summary.results.push({
          ...diagnostics,
          status: response?.status() ?? null,
          screenshot: path.relative(process.cwd(), screenshotPath),
          viewportScreenshot: path.relative(process.cwd(), viewportScreenshotPath),
          consoleMessages,
        });

        await page.close();
      }

      await context.close();
    }

    summary.interactionChecks = await runCoachTabInteractionChecks(browser);

    await browser.close();
    await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

    const visualIssueCount = summary.results.reduce((total, result) => {
      const coachTabHeightMismatch =
        result.coachTabs &&
        result.coachTabs.viewportHeight !== null &&
        result.coachTabs.activePanelHeight !== null &&
        result.coachTabs.viewportHeight + 2 < result.coachTabs.activePanelHeight;
      const coachTabRouteMismatch =
        typeof result.route.expectedCoachTabIndex === "number" &&
        result.coachTabs &&
        result.coachTabs.activePanelIndex !== result.route.expectedCoachTabIndex;
      const routeIssueCount =
        Number(result.hasHorizontalOverflow) +
        result.clippedTextCandidates.length +
        result.consoleMessages.length +
        Number(coachTabHeightMismatch) +
        Number(coachTabRouteMismatch);

      return total + routeIssueCount;
    }, 0);
    const interactionIssueCount = summary.interactionChecks.filter((check) => !check.passed).length;
    const issueCount = visualIssueCount + interactionIssueCount;

    console.log(`UI review screenshots: ${path.relative(process.cwd(), screenshotDir)}`);
    console.log(`UI review summary: ${path.relative(process.cwd(), summaryPath)}`);
    console.log(`Diagnostics issue count: ${issueCount}`);

    if (issueCount > 0) {
      console.log("Review summary.json and screenshots before accepting the UI.");
    }
  } finally {
    if (server) {
      await stopServer(server);
      const outputPath = path.join(artifactRoot, "server.log");
      await fs.writeFile(outputPath, server.getOutput());
    }
  }
}

runReview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
