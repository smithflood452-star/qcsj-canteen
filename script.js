/* =========================================================
   青春集市 · 比思睿生活驿站 — script.js
   原生 JavaScript，零依赖。渲染与交互：
   导航 / 档口地图 / 档口列表与详情 / 区域大图 / 轮播 /
   意见反馈（预留接口 + 本地兜底）/ 弹层管理 / 回到顶部
   ========================================================= */

(function () {
  "use strict";

  var DATA = window.CANTEEN_DATA;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 工具函数 ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text != null) { node.textContent = text; }
    return node;
  }
  function categoryName(id) {
    var hit = (DATA.categories || []).filter(function (c) { return c.id === id; })[0];
    return hit ? hit.name : "其他";
  }
  function zoneName(id) {
    var z = DATA.zones[id];
    return z ? z.name : "";
  }
  function zoneShort(id) {
    var z = DATA.zones[id];
    return z && z.short ? z.short : (z ? z.name : "");
  }
  function pictureNode(img) {
    /* img: { jpg, webp, alt } */
    var pic = el("picture");
    if (img.webp) {
      var source = document.createElement("source");
      source.srcset = img.webp;
      source.type = "image/webp";
      pic.appendChild(source);
    }
    var image = el("img");
    image.src = img.jpg;
    image.alt = img.alt || "";
    image.loading = "lazy";
    image.decoding = "async";
    pic.appendChild(image);
    return pic;
  }

  /* =========================================================
     1. 顶部导航：汉堡菜单 / 滚动态 / 滚动高亮
     ========================================================= */
  var siteHeader = $("#siteHeader");
  var mainNav = $("#mainNav");
  var navToggle = $("#navToggle");
  var navBackdrop = $("#navBackdrop");

  function openNav() {
    document.body.classList.add("nav-open");
    mainNav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "关闭导航菜单");
    navBackdrop.hidden = false;
    requestAnimationFrame(function () { navBackdrop.classList.add("is-visible"); });
  }
  function closeNav() {
    document.body.classList.remove("nav-open");
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开导航菜单");
    navBackdrop.classList.remove("is-visible");
    window.setTimeout(function () { navBackdrop.hidden = true; }, 250);
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      if (mainNav.classList.contains("is-open")) { closeNav(); } else { openNav(); }
    });
    navBackdrop.addEventListener("click", closeNav);
    $$(".nav-link, .nav-cta", mainNav).forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  /* 头部滚动态 + 当前区块高亮 */
  var navLinks = $$(".nav-link");
  var sections = $$("main section[id]");
  var toTopBtn = $("#toTop");
  var scrollTicking = false;
  function onScroll() {
    if (scrollTicking) { return; }
    scrollTicking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      siteHeader.classList.toggle("is-scrolled", y > 8);

      var currentId = "";
      var offset = (siteHeader.offsetHeight || 64) + 24;
      sections.forEach(function (sec) {
        if (sec.getBoundingClientRect().top <= offset) { currentId = sec.id; }
      });
      navLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + currentId);
      });

      if (toTopBtn) { toTopBtn.hidden = y < 480; }
      scrollTicking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* =========================================================
     2. 档口地图：分区 / 出入口 / 铺位 / 图例
     ========================================================= */
  function renderMap() {
    var zonesEl = $("#mapZones");
    var doorsEl = $("#mapDoors");
    var pinsEl = $("#mapPins");
    var legendEl = $("#mapLegend");
    if (!zonesEl || !DATA) { return; }

    /* 分区底色块 */
    Object.keys(DATA.zones).forEach(function (id) {
      var z = DATA.zones[id];
      var block = el("div", "map-zone");
      block.dataset.zone = id;
      block.style.left = z.rect.x + "%";
      block.style.top = z.rect.y + "%";
      block.style.width = z.rect.w + "%";
      block.style.height = z.rect.h + "%";
      block.appendChild(el("span", "zone-label", z.name));
      zonesEl.appendChild(block);

      /* 桌面悬停高亮 */
      block.addEventListener("mouseenter", function () {
        $("#mapCanvas").classList.add("zone-hover");
        block.classList.add("is-hovered");
      });
      block.addEventListener("mouseleave", function () {
        $("#mapCanvas").classList.remove("zone-hover");
        block.classList.remove("is-hovered");
      });
    });

    /* 出入口 */
    (DATA.doors || []).forEach(function (d) {
      var door = el("span", "map-door", d.name);
      door.dataset.door = d.id;
      doorsEl.appendChild(door);
    });

    /* 铺位：档口 + 附加点位 */
    (DATA.stalls || []).forEach(function (stall) {
      pinsEl.appendChild(makePin({
        short: stall.short || stall.name,
        kind: "stall",
        stall: stall,
        pos: stall.pos
      }));
    });
    (DATA.mapPoints || []).forEach(function (point) {
      pinsEl.appendChild(makePin({
        short: point.short || point.name,
        kind: point.kind, /* service / scenery / closed */
        point: point,
        pos: point.pos
      }));
    });

    /* 图例（含档口计数） */
    Object.keys(DATA.zones).forEach(function (id) {
      var z = DATA.zones[id];
      var count = (DATA.stalls || []).filter(function (s) { return s.zoneId === id; }).length;
      var li = el("li");
      var dot = el("span", "legend-dot");
      dot.dataset.zone = id;
      li.appendChild(dot);
      li.appendChild(el("span", null, z.name));
      li.appendChild(el("span", "legend-count", count + " 个档口"));
      legendEl.appendChild(li);
    });
  }

  function makePin(cfg) {
    var pin = el("button", "map-pin", cfg.short);
    pin.type = "button";
    pin.style.left = cfg.pos.x + "%";
    pin.style.top = cfg.pos.y + "%";

    if (cfg.kind === "service") {
      pin.classList.add("map-pin--service");
      pin.setAttribute("aria-label", cfg.point.name + "（服务点）");
    } else if (cfg.kind === "closed") {
      pin.classList.add("map-pin--closed");
      pin.appendChild(el("span", "map-pin__badge", "暂未开放"));
      pin.setAttribute("aria-label", cfg.point.name + "，暂未开放");
    } else if (cfg.kind === "stall") {
      pin.setAttribute("aria-label", cfg.stall.name + "档口，点击查看照片");
    } else {
      pin.setAttribute("aria-label", cfg.point.name);
    }

    pin.addEventListener("click", function () {
      if (cfg.kind === "stall") {
        openPhotoModal({
          photo: cfg.stall.photo,
          title: cfg.stall.name,
          desc: categoryName(cfg.stall.categoryId) + " · " + zoneName(cfg.stall.zoneId),
          stall: cfg.stall
        });
      } else {
        openPhotoModal({
          photo: cfg.point.photo,
          title: cfg.point.name + (cfg.kind === "closed" ? "（暂未开放）" : ""),
          desc: cfg.point.desc,
          stall: null
        });
      }
    });
    return pin;
  }

  /* =========================================================
     3. 档口列表：分类 / 搜索 / 卡片 / 详情弹层
     ========================================================= */
  var listState = { q: "", cat: "all" };

  function renderChips() {
    var wrap = $("#categoryChips");
    if (!wrap) { return; }
    wrap.innerHTML = "";
    (DATA.categories || []).forEach(function (cat) {
      var chip = el("button", "chip", cat.name);
      chip.type = "button";
      chip.dataset.cat = cat.id;
      chip.setAttribute("aria-pressed", cat.id === listState.cat ? "true" : "false");
      if (cat.id === listState.cat) { chip.classList.add("is-active"); }
      chip.addEventListener("click", function () {
        listState.cat = cat.id;
        $$(".chip", wrap).forEach(function (c) {
          var on = c.dataset.cat === cat.id;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        renderStalls();
      });
      wrap.appendChild(chip);
    });
  }

  function filteredStalls() {
    var q = listState.q.trim().toLowerCase();
    return (DATA.stalls || []).filter(function (s) {
      var catOk = listState.cat === "all" || s.categoryId === listState.cat;
      if (!catOk) { return false; }
      if (!q) { return true; }
      var haystack = [s.name, categoryName(s.categoryId), zoneName(s.zoneId), s.desc || ""]
        .join(" ").toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
  }

  function renderStalls() {
    var grid = $("#stallGrid");
    var empty = $("#stallEmpty");
    var count = $("#stallCount");
    if (!grid) { return; }

    var list = filteredStalls();
    grid.innerHTML = "";
    count.textContent = "共 " + list.length + " 家档口" +
      (listState.cat !== "all" ? "（" + categoryName(listState.cat) + "）" : "");

    list.forEach(function (stall) {
      var card = el("article", "stall-card");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "查看「" + stall.name + "」详情");

      var media = el("div", "stall-card-media");
      media.appendChild(pictureNode(stall.photo));
      var zoneTag = el("span", "stall-card-zone", zoneShort(stall.zoneId));
      media.appendChild(zoneTag);
      card.appendChild(media);

      var body = el("div", "stall-card-body");
      body.appendChild(el("h3", "stall-card-name", stall.name));
      var meta = el("div", "stall-card-meta");
      meta.appendChild(el("span", "stall-tag stall-tag--cat", categoryName(stall.categoryId)));
      meta.appendChild(el("span", "stall-tag stall-tag--zone", zoneShort(stall.zoneId)));
      body.appendChild(meta);
      if (stall.desc) { body.appendChild(el("p", "stall-card-desc", stall.desc)); }
      card.appendChild(body);

      function open() { openStallModal(stall); }
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
      grid.appendChild(card);
    });

    empty.hidden = list.length > 0;
  }

  function bindStallTools() {
    var input = $("#stallSearch");
    var clearBtn = $("#searchClear");
    if (input) {
      input.addEventListener("input", function () {
        listState.q = input.value;
        clearBtn.hidden = !input.value;
        renderStalls();
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        input.value = "";
        listState.q = "";
        clearBtn.hidden = true;
        renderStalls();
        input.focus();
      });
    }
    var reset = $("#stallEmptyReset");
    if (reset) {
      reset.addEventListener("click", function () {
        listState = { q: "", cat: "all" };
        if (input) { input.value = ""; }
        if (clearBtn) { clearBtn.hidden = true; }
        renderChips();
        renderStalls();
      });
    }
  }

  /* 档口详情弹层 */
  function openStallModal(stall) {
    $("#stallModalSource").srcset = stall.photo.webp || "";
    $("#stallModalImg").src = stall.photo.jpg;
    $("#stallModalImg").alt = stall.photo.alt || stall.name;
    $("#stallModalTitle").textContent = stall.name;
    $("#stallModalCat").textContent = categoryName(stall.categoryId);
    $("#stallModalZone").textContent = "所在分区：" + zoneName(stall.zoneId);
    $("#stallModalDesc").textContent = stall.desc || "";

    /* 菜单预留位：
       - menu.sections  → 结构化菜单（整理自点单页面截图）
       - menu.jpg       → 菜单照片（档口灯箱实拍）
       - menu.photos    → 点单页面截图依据
       - 无             → 占位说明 */
    var slot = $("#stallMenuSlot");
    slot.innerHTML = "";
    slot.appendChild(el("div", "menu-slot-title", "菜单"));

    if (stall.menu && stall.menu.sections) {
      if (stall.menu.source) {
        slot.appendChild(el("p", "menu-slot-source", stall.menu.source));
      }
      stall.menu.sections.forEach(function (sec) {
        slot.appendChild(el("h4", "menu-section-title", sec.name));
        var list = el("ul", "menu-list");
        (sec.items || []).forEach(function (item) {
          var li = el("li", "menu-item");
          var nameWrap = el("span", "menu-item-name");
          nameWrap.textContent = item.name;
          if (item.hot) {
            nameWrap.appendChild(el("span", "menu-item-hot", "爆款"));
          }
          li.appendChild(nameWrap);
          li.appendChild(el("span", "menu-item-price", "¥" + item.price));
          list.appendChild(li);
        });
        slot.appendChild(list);
      });
      /* 截图依据 */
      if (stall.menu.photos && stall.menu.photos.length) {
        slot.appendChild(el("p", "menu-slot-photos-title", "点单页面原图"));
        stall.menu.photos.forEach(function (ph) {
          var figure = el("figure", "menu-slot-img menu-slot-img--tall");
          figure.appendChild(pictureNode({
            jpg: ph.jpg, webp: ph.webp, alt: "档口点单页面截图"
          }));
          if (ph.caption) {
            figure.appendChild(el("figcaption", "menu-slot-caption", ph.caption));
          }
          slot.appendChild(figure);
        });
      }
    } else if (stall.menu && stall.menu.jpg) {
      var box = el("div", "menu-slot-img");
      box.appendChild(pictureNode({
        jpg: stall.menu.jpg,
        webp: stall.menu.webp,
        alt: stall.name + "菜单照片"
      }));
      slot.appendChild(box);
      if (stall.menu.caption) {
        slot.appendChild(el("p", "menu-slot-caption", stall.menu.caption));
      }
    } else {
      var placeholder = el("div", "menu-slot-box");
      placeholder.appendChild(el("p", null, "菜单整理中"));
      placeholder.appendChild(el("p", "menu-slot-hint", DATA.site.disclaimer));
      slot.appendChild(placeholder);
    }
    openModal("stallModal");
  }

  /* =========================================================
     4. 「不止于食堂」卡片 → 照片弹层
     ========================================================= */
  function bindBeyond() {
    $$(".beyond-card").forEach(function (card) {
      function open() {
        var btn = $(".beyond-more", card);
        openPhotoModal({
          photo: { jpg: btn.dataset.photo, webp: btn.dataset.photoWebp, alt: btn.dataset.title },
          title: btn.dataset.title,
          desc: btn.dataset.desc,
          stall: null
        });
      }
      card.addEventListener("click", function (e) {
        if (e.target.closest(".beyond-more")) { return; } /* 按钮自身已触发 */
        open();
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });
    $$(".beyond-more").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        openPhotoModal({
          photo: { jpg: btn.dataset.photo, webp: btn.dataset.photoWebp, alt: btn.dataset.title },
          title: btn.dataset.title,
          desc: btn.dataset.desc,
          stall: null
        });
      });
    });
  }

  /* =========================================================
     5. 弹层管理（照片弹层 / 档口详情弹层共用）
     ========================================================= */
  var activeModal = null;
  var lastFocused = null;

  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) { return; }
    if (activeModal) { closeModal(); }
    lastFocused = document.activeElement;
    activeModal = modal;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    var closeBtn = $(".modal-close", modal);
    if (closeBtn) { closeBtn.focus(); }
  }

  function openPhotoModal(cfg) {
    $("#photoModalSource").srcset = (cfg.photo && cfg.photo.webp) || "";
    $("#photoModalImg").src = cfg.photo.jpg;
    $("#photoModalImg").alt = cfg.photo.alt || cfg.title;
    $("#photoModalTitle").textContent = cfg.title;
    $("#photoModalDesc").textContent = cfg.desc || "";
    var link = $("#photoModalLink");
    if (cfg.stall) {
      link.hidden = false;
      link.onclick = function () { openStallModal(cfg.stall); };
    } else {
      link.hidden = true;
      link.onclick = null;
    }
    openModal("photoModal");
  }

  function closeModal() {
    if (!activeModal) { return; }
    activeModal.hidden = true;
    activeModal = null;
    document.body.classList.remove("modal-open");
    if (lastFocused && lastFocused.focus) { lastFocused.focus(); }
  }

  function bindModals() {
    $$("[data-close]").forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (activeModal) { closeModal(); }
        else if (mainNav.classList.contains("is-open")) { closeNav(); }
      }
      /* 焦点圈定在弹层内 */
      if (e.key === "Tab" && activeModal) {
        var focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', activeModal)
          .filter(function (n) { return n.offsetParent !== null; });
        if (!focusables.length) { return; }
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* =========================================================
     6. 食堂环境轮播
     ========================================================= */
  function initCarousel() {
    var track = $("#carouselTrack");
    var dotsWrap = $("#carouselDots");
    if (!track) { return; }
    var slides = $$(".slide", track);
    var index = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = el("button", "carousel-dot");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "第 " + (i + 1) + " 张");
      dot.addEventListener("click", function () { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
    });

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      $$(".carousel-dot", dotsWrap).forEach(function (d, di) {
        var on = di === index;
        d.classList.toggle("is-active", on);
        d.setAttribute("aria-selected", on ? "true" : "false");
      });
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    $("#carouselNext").addEventListener("click", function () { next(); restart(); });
    $("#carouselPrev").addEventListener("click", function () { prev(); restart(); });

    function start() {
      if (reduceMotion || timer) { return; }
      timer = window.setInterval(next, 5000);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    var carousel = $("#carousel");
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);

    /* 移动端触摸滑动 */
    var startX = 0;
    var startY = 0;
    var touching = false;
    var viewport = $(".carousel-viewport");
    viewport.addEventListener("touchstart", function (e) {
      touching = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      stop();
    }, { passive: true });
    viewport.addEventListener("touchend", function (e) {
      if (!touching) { return; }
      touching = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) { next(); } else { prev(); }
      }
      start();
    }, { passive: true });

    goTo(0);
    start();
  }

  /* =========================================================
     7. 意见反馈表单（预留接口 + 本地兜底）
     ========================================================= */
  function initFeedback() {
    var form = $("#feedbackForm");
    if (!form) { return; }
    var typeSel = $("#fbType");
    var content = $("#fbContent");
    var contact = $("#fbContact");
    var counter = $("#fbCount");
    var status = $("#formStatus");
    var submitBtn = $("#fbSubmit");

    content.addEventListener("input", function () {
      counter.textContent = String(content.value.length);
    });

    function showError(input, errEl, msg) {
      errEl.textContent = msg || "";
      input.classList.toggle("has-error", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";

      var ok = true;
      if (!typeSel.value) {
        showError(typeSel, $("#fbTypeError"), "请选择反馈类型");
        ok = false;
      } else {
        showError(typeSel, $("#fbTypeError"), "");
      }
      var text = content.value.trim();
      if (!text) {
        showError(content, $("#fbContentError"), "请填写反馈内容");
        ok = false;
      } else {
        showError(content, $("#fbContentError"), "");
      }
      if (!ok) { return; }

      var payload = {
        type: typeSel.value,
        typeName: typeSel.options[typeSel.selectedIndex].text,
        content: text,
        contact: contact.value.trim(),
        page: location.href,
        createdAt: new Date().toISOString()
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "提交中…";
      status.textContent = "正在提交，请稍候…";

      submitFeedback(payload)
        .then(function (mode) {
          status.classList.add("is-success");
          status.textContent = mode === "api"
            ? "提交成功，感谢你的反馈！我们将尽快跟进处理。"
            : "接口暂未接入，你的反馈已暂存到本机浏览器，接入后将自动同步。感谢！";
          form.reset();
          counter.textContent = "0";
        })
        .catch(function () {
          status.classList.add("is-error");
          status.textContent = "提交失败，请稍后重试，或到现场大使服务中心反馈。";
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "提交反馈";
        });
    });

    /* 预留 API：成功返回 "api"；未接入 / 请求失败时本地暂存并返回 "local" */
    function submitFeedback(payload) {
      var endpoint = (DATA.feedback && DATA.feedback.endpoint) || "/api/feedback";
      var storageKey = (DATA.feedback && DATA.feedback.storageKey) || "qcsj_feedback_queue";

      function saveLocal() {
        try {
          var queue = JSON.parse(localStorage.getItem(storageKey) || "[]");
          queue.push(payload);
          localStorage.setItem(storageKey, JSON.stringify(queue));
        } catch (err) { /* 本地存储不可用时静默降级 */ }
      }

      return new Promise(function (resolve) {
        /* 浏览器不支持 fetch 时直接走本地兜底 */
        if (typeof fetch !== "function") { saveLocal(); resolve("local"); return; }
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then(function (res) {
          if (!res.ok) { saveLocal(); resolve("local"); return; }
          resolve("api");
        }).catch(function () {
          saveLocal();
          resolve("local");
        });
      });
    }
  }

  /* =========================================================
     8. 回到顶部
     ========================================================= */
  function initToTop() {
    var btn = $("#toTop");
    if (!btn) { return; }
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* =========================================================
     初始化
     ========================================================= */
  function init() {
    if (!DATA) {
      var fallback = $("#mapCanvas");
      if (fallback) {
        var p = el("p", "map-fallback");
        p.hidden = false;
        p.textContent = "数据加载失败，请刷新页面重试。";
        fallback.appendChild(p);
      }
      return;
    }
    renderMap();
    renderChips();
    renderStalls();
    bindStallTools();
    bindBeyond();
    bindModals();
    initCarousel();
    initFeedback();
    initToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
