(() => {
    // ==== CONFIG ================================================================
    const BASE_URL = "http://localhost:3000"; // your Bun server
    const ENDPOINT = `${BASE_URL}/profiles`;
  
    // ==== SELECTORS (adjust if site changes) ===================================
    const SEL = {
      header:
        '#__next > main > div > div.layout_content__YaJpS.ask-wrapper_root__sBHeA > div > div._id__content__ZwW40 > div.header_root__SlQw5',
      profileWrap:
        '#__next > main > div > div.layout_content__YaJpS.ask-wrapper_root__sBHeA > div > div._id__content__ZwW40 > div:nth-child(3) > div > div > div',
      commentsRoot:
        '#__next > main > div > div.layout_content__YaJpS.ask-wrapper_root__sBHeA > div > div:nth-child(3)',
    };
  
    // ==== UTILS ================================================================
    const qs = (root, s) => (root || document).querySelector(s);
    const qsa = (root, s) => Array.from((root || document).querySelectorAll(s));
    const text = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
    const html = (el) => (el ? el.innerHTML.trim() : null);
  
    function toast(msg, ok = true) {
      try {
        const t = document.createElement("div");
        t.textContent = msg;
        Object.assign(t.style, {
          position: "fixed",
          right: "16px",
          bottom: "16px",
          padding: "10px 12px",
          background: ok ? "rgba(0,0,0,0.8)" : "rgba(180,0,0,0.9)",
          color: "#fff",
          borderRadius: "10px",
          zIndex: 2147483647,
          font: "12px system-ui, -apple-system, Segoe UI, Roboto",
          boxShadow: "0 8px 24px rgba(0,0,0,.25)",
        });
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 1800);
      } catch {}
    }
  
    // ==== SCRAPER ==============================================================
  
    function getHeaderEl() {
      return (
        qs(document, SEL.header) ||
        qs(document, ".header_root__SlQw5") ||
        document
      );
    }
  
    function getName() {
      const header = getHeaderEl();
      return (
        text(qs(header, "a.header_name__gplKq")) ||
        text(qs(header, ".header_name__gplKq a")) ||
        text(qs(header, 'a[href^="/people/"]')) ||
        null
      );
    }
  
    function getTagline() {
      const header = getHeaderEl();
      return (
        text(qs(header, ".header_oneLiner__Ig5mk")) ||
        text(qs(header, ".header_oneLiner___26Ks")) ||
        null
      );
    }
  
    function getProfilePicUrl() {
      const header = getHeaderEl();
      const img =
        qs(header, "img.avatar_root__oaqQQ") ||
        qs(header, 'img[decoding="async"]') ||
        qs(header, "img");
      if (!img) return null;
      // .src resolves to absolute URL even if Next.js transforms it
      return img.src || null;
    }
  
    function scrapeProfile() {
      // Profile prose container
      const profileContainer =
        qs(document, SEL.profileWrap) ||
        // fallback: first ProseMirror under content area
        qs(document, "div._id__content__ZwW40 .ProseMirror")?.closest("div") ||
        null;
  
      const profileProse =
        (profileContainer && qs(profileContainer, ".ProseMirror")) ||
        profileContainer ||
        null;
  
      const profileText = text(profileProse);
      const profileRawHtml = html(profileProse);
  
      // Comments
      const commentsRoot =
        qs(document, SEL.commentsRoot) || qs(document, "div._id__content__ZwW40");
      const commentBlocks = qsa(commentsRoot, ".comment_root__yukpw");
  
      const comments = commentBlocks.map((c) => {
        const authorA =
          qs(c, ".header_name__hqUA_") ||
          qs(c, '.header_info__6uqH0 a[href^="/people/"]');
        const authorName = text(authorA);
        const authorHref = authorA?.getAttribute("href") || null;
        const authorTagline = text(qs(c, ".header_oneLiner___26Ks"));
        const created = text(qs(c, ".header_created__zOPKi"));
        const bodyEl =
          qs(c, ".editor_container__kWuhW .ProseMirror") || qs(c, ".ProseMirror");
        const bodyText = text(bodyEl);
        const bodyHtml = html(bodyEl);
        const likesEl = qs(c, ".default-component_counter__2UIV7");
        const likes = likesEl ? parseInt(likesEl.textContent.trim(), 10) || 0 : 0;
  
        return {
          authorName: authorName || null,
          authorTagline: authorTagline || null,
          authorHref,
          dateText: created || null,
          text: bodyText || null,
          rawHtml: bodyHtml || null,
          likes,
        };
      });
  
      return {
        name: getName(),
        tagline: getTagline(),
        profileText: profileText || null,
        profileRawHtml: profileRawHtml || null,
        comments,
      };
    }
  
    // expose for manual use if you want
    window.scrapeProfile = scrapeProfile;
  
    // ==== NETWORK HELPERS ======================================================
  
    async function postProfile(data) {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data, null, 2),
      });
      const txt = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(txt);
      } catch {
        parsed = txt;
      }
      if (!res.ok) throw new Error(`POST /profiles ${res.status}: ${txt}`);
      return parsed;
    }
  
    async function patchProfilePic({ name, profilePicUrl }) {
      const res = await fetch(ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profilePicUrl }),
      });
      const txt = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(txt);
      } catch {
        parsed = txt;
      }
      if (!res.ok) throw new Error(`PATCH /profiles ${res.status}: ${txt}`);
      return parsed;
    }
  
    // expose if you want to call manually
    window.postProfile = postProfile;
    window.patchProfilePic = patchProfilePic;
  
    // ==== KEYBOARD SHORTCUTS ===================================================
    if (!window.__profileHotkeysInstalled) {
      document.addEventListener("keydown", async (e) => {
        // Shift + D => scrape + POST
        if (e.shiftKey && e.key.toLowerCase() === "d") {
          try {
            const payload = scrapeProfile();
            if (!payload.name) throw new Error("No name found in header.");
            console.log("Shift+D → POST", payload);
            const out = await postProfile(payload);
            console.log("✅ POST ok:", out);
            toast("✅ Profile posted");
          } catch (err) {
            console.error(err);
            toast("❌ Failed to POST (see console)", false);
          }
        }
  
        // Shift + W => PATCH profile picture URL
        if (e.shiftKey && e.key.toLowerCase() === "w") {
          try {
            const name = getName();
            const url = getProfilePicUrl();
            if (!name || !url)
              throw new Error("Missing name or profilePicUrl from the page.");
            console.log("Shift+W → PATCH", { name, profilePicUrl: url });
            const out = await patchProfilePic({ name, profilePicUrl: url });
            console.log("✅ PATCH ok:", out);
            toast("✅ Profile picture patched");
          } catch (err) {
            console.error(err);
            toast("❌ Failed to PATCH (see console)", false);
          }
        }
      });
  
      window.__profileHotkeysInstalled = true;
      console.log(
        "🔗 Bound hotkeys: Shift+D (POST /profiles), Shift+W (PATCH profilePicUrl)."
      );
    }
  })();
  