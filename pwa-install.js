(function () {
  if (window.__pwaInstallBound) return;
  window.__pwaInstallBound = true;

  var ua = navigator.userAgent || "";
  var iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  var iosSafari = iOS && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Instagram|FBAN|FBAV|Line\//i.test(ua);
  var wantInstall = /(?:\?|&)install=1(?:&|#|$)/.test(location.search + location.hash) || location.hash.indexOf("install") !== -1;
  var isEn = /\/english\/?$/.test(location.pathname.replace(/index\.html$/, ""));
  var langParam = "";
  try { langParam = (new URLSearchParams(location.search)).get("lang") || ""; } catch (e) {}
  var deferredPrompt = null;

  var tHi = {
    install: "इंस्टॉल",
    installing: "इंस्टॉल खुल रहा है…",
    installed: "होम स्क्रीन पर जोड़ा गया",
    wait: "इंस्टॉल बटन तैयार हो रहा है…",
    chromeMenu: "Chrome मेनू (⋮) → ऐप इंस्टॉल करें",
    iosTitle: "होम स्क्रीन पर जोड़ें",
    iosSafari: "पहले Safari में यह पृष्ठ खोलें। होम स्क्रीन जोड़ केवल Safari में उपलब्ध है।",
    copy: "लिंक कॉपी करें",
    copied: "कॉपी हो गया",
    close: "बंद करें",
    step1: "Safari के नीचे शेयर बटन दबाएं",
    step2: "सूची में ऊपर जाकर होम स्क्रीन पर जोड़ें दबाएं",
    step3: "ऊपर दाएं जोड़ें दबाएं",
    bar: "होम स्क्रीन पर जोड़ें"
  };
  var t = isEn ? {
    install: "Install",
    installing: "Opening install…",
    installed: "Added to Home screen",
    wait: "Preparing the install button…",
    chromeMenu: "Chrome menu (⋮) → Install app",
    iosTitle: "Add to Home Screen",
    iosSafari: "Open this page in Safari first. Add to Home Screen is only available in Safari.",
    copy: "Copy link",
    copied: "Copied",
    close: "Close",
    step1: "Tap the Share button at the bottom of Safari",
    step2: "Scroll and tap Add to Home Screen",
    step3: "Tap Add at the top right",
    bar: "Add to Home Screen"
  } : (langParam === "hi" ? tHi : {
    install: "홈 화면에 설치",
    installing: "설치 창을 엽니다…",
    installed: "홈 화면에 추가되었습니다",
    wait: "설치 버튼을 준비하는 중입니다…",
    chromeMenu: "Chrome 오른쪽 위 ⋮ → 앱 설치 를 눌러 주세요",
    iosTitle: "홈 화면에 추가",
    iosSafari: "Safari로 이 페이지를 연 다음 추가해 주세요. 홈 화면 추가는 Safari에서만 됩니다.",
    copy: "주소 복사",
    copied: "복사됨",
    close: "닫기",
    step1: "Safari 아래 공유 버튼을 누르세요",
    step2: "목록을 올려 「홈 화면에 추가」를 누르세요",
    step3: "오른쪽 위 「추가」를 누르면 완료입니다",
    bar: "홈 화면에 추가"
  });

  if ("serviceWorker" in navigator) {
    var base = location.origin + location.pathname.replace(/index\.html$/, "");
    if (base.charAt(base.length - 1) !== "/") base += "/";
    navigator.serviceWorker.register(base + "sw.js").catch(function () {});
  }

  if (standalone) return;

  var css = document.createElement("style");
  css.textContent =
    "#pwaBar{position:fixed;left:12px;right:12px;bottom:16px;z-index:9998;display:none;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:14px;background:#1a1208;color:#fff;font-family:sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.28)}" +
    "#pwaBar b{font-size:14px}" +
    "#pwaBar button,#pwaSheet button{font:700 13px/1.2 sans-serif;border:0;border-radius:10px;padding:10px 12px;cursor:pointer}" +
    "#pwaBar .pwaGo{background:#d4a017;color:#1a1208}" +
    "#pwaBar .pwaX{background:transparent;color:#fff;padding:8px}" +
    "#pwaSheet{position:fixed;inset:0;z-index:9999;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45)}" +
    "#pwaSheet .pwaCard{width:min(440px,100%);background:#fffaf2;border-radius:18px 18px 0 0;padding:18px 16px 28px;color:#2a1c0c}" +
    "#pwaSheet h2{margin:0 0 12px;font-size:18px;text-align:center}" +
    "#pwaSheet .pwaWarn{background:#fff3d6;border:1px solid #e6c56a;border-radius:10px;padding:10px 12px;font-size:13px;margin:0 0 12px}" +
    ".pwaSteps{display:flex;flex-direction:column;gap:10px;margin:0 0 14px}" +
    ".pwaStep{display:flex;gap:10px;align-items:center;background:#fff;border:1px solid #e6d7b8;border-radius:12px;padding:10px}" +
    ".pwaNum{flex:0 0 26px;height:26px;border-radius:50%;background:#8a5a12;color:#fff;display:grid;place-items:center;font-size:13px;font-weight:700}" +
    ".pwaPic{flex:0 0 52px;height:44px}" +
    ".pwaStep p{margin:0;font-size:13px;line-height:1.45}" +
    "#pwaSheet .pwaClose{width:100%;background:#8a5a12;color:#fff}";
  document.head.appendChild(css);

  function shareSvg() {
    return '<svg class="pwaPic" viewBox="0 0 52 44" aria-hidden="true"><rect x="1" y="1" width="50" height="42" rx="8" fill="#f4f4f6" stroke="#c5c5cc"/><rect x="8" y="32" width="36" height="6" rx="3" fill="#e8e8ee"/><g transform="translate(20,6)" fill="none" stroke="#0a84ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14"/><path d="M2 6l4-4 4 4"/><path d="M1 16v6a2 2 0 002 2h6a2 2 0 002-2v-6"/></g></svg>';
  }
  function addSvg() {
    return '<svg class="pwaPic" viewBox="0 0 52 44" aria-hidden="true"><rect x="1" y="1" width="50" height="42" rx="8" fill="#fff" stroke="#c5c5cc"/><rect x="6" y="18" width="40" height="10" rx="5" fill="#0a84ff"/><text x="26" y="26" text-anchor="middle" font-size="7" font-family="sans-serif" fill="#fff">+</text></svg>';
  }
  function okSvg() {
    return '<svg class="pwaPic" viewBox="0 0 52 44" aria-hidden="true"><rect x="1" y="1" width="50" height="42" rx="8" fill="#fff" stroke="#c5c5cc"/><text x="40" y="14" text-anchor="end" font-size="8" font-family="sans-serif" fill="#0a84ff" font-weight="700">Add</text><rect x="14" y="18" width="24" height="16" rx="4" fill="#eee"/><path d="M20 26h12M26 20v12" stroke="#8a5a12" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  var sheet = document.createElement("div");
  sheet.id = "pwaSheet";
  sheet.innerHTML =
    '<div class="pwaCard">' +
      "<h2>" + t.iosTitle + "</h2>" +
      (iosSafari ? "" : '<p class="pwaWarn" id="pwaSafariWarn">' + t.iosSafari + "</p>") +
      '<div class="pwaSteps">' +
        '<div class="pwaStep"><span class="pwaNum">1</span>' + shareSvg() + "<p>" + t.step1 + "</p></div>" +
        '<div class="pwaStep"><span class="pwaNum">2</span>' + addSvg() + "<p>" + t.step2 + "</p></div>" +
        '<div class="pwaStep"><span class="pwaNum">3</span>' + okSvg() + "<p>" + t.step3 + "</p></div>" +
      "</div>" +
      (iosSafari ? "" : '<button type="button" id="pwaCopy">' + t.copy + "</button>") +
      '<button type="button" class="pwaClose" id="pwaClose">' + t.close + "</button>" +
    "</div>";
  document.body.appendChild(sheet);

  var bar = document.createElement("div");
  bar.id = "pwaBar";
  bar.innerHTML = "<b>" + t.bar + "</b><span><button type='button' class='pwaGo' id='pwaGo'>" + t.install + "</button><button type='button' class='pwaX' id='pwaX' aria-label='close'>×</button></span>";
  document.body.appendChild(bar);

  function showSheet() { sheet.style.display = "flex"; }
  function hideSheet() { sheet.style.display = "none"; }
  function showBar(label) {
    bar.style.display = "flex";
    var go = document.getElementById("pwaGo");
    if (label) go.textContent = label;
  }
  function hideBar() { bar.style.display = "none"; }

  document.getElementById("pwaClose").onclick = hideSheet;
  sheet.addEventListener("click", function (e) { if (e.target === sheet) hideSheet(); });
  var copyBtn = document.getElementById("pwaCopy");
  if (copyBtn) {
    copyBtn.onclick = function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(function () { copyBtn.textContent = t.copied; });
      }
    };
  }
  document.getElementById("pwaX").onclick = function () {
    hideBar();
    try { sessionStorage.setItem("pwaBarHide", "1"); } catch (e) {}
  };

  function tryPrompt() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () {
      deferredPrompt = null;
      hideBar();
    });
  }

  document.getElementById("pwaGo").onclick = function () {
    if (iOS) showSheet();
    else if (deferredPrompt) tryPrompt();
    else if (android) {
      document.getElementById("pwaGo").textContent = t.chromeMenu;
    }
  };

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showBar(t.install);
    if (wantInstall && android) {
      document.getElementById("pwaGo").textContent = t.install;
    }
  });
  window.addEventListener("appinstalled", function () {
    hideBar();
    hideSheet();
    deferredPrompt = null;
  });

  var hideStored = false;
  try { hideStored = sessionStorage.getItem("pwaBarHide") === "1"; } catch (e) {}

  if (iOS) {
    if (wantInstall) showSheet();
    else if (!hideStored) showBar(t.bar);
  } else if (android && wantInstall) {
    showBar(t.wait);
    setTimeout(function () {
      if (!deferredPrompt) document.getElementById("pwaGo").textContent = t.chromeMenu;
    }, 4000);
  }
})();
