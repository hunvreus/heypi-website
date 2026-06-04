(() => {
	const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
	const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

	const copyText = async (text) => {
		if (window.isSecureContext && navigator.clipboard?.writeText) {
			return navigator.clipboard.writeText(text);
		}

		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.top = "-9999px";
		textarea.style.left = "-9999px";
		document.body.appendChild(textarea);
		textarea.select();
		const ok = document.execCommand("copy");
		textarea.remove();
		if (!ok) throw new Error("Copy failed");
	};

	const initCopyCode = (pre) => {
		if (pre.dataset.copyCode === "false" || pre.closest("[data-copy-code='false']")) {
			pre.dataset.copyCodeInitialized = "true";
			return;
		}

		const code = pre.querySelector(":scope > code");
		if (!code) return;

		const button = document.createElement("button");
		button.type = "button";
		button.className = "code-block-copy";
		button.setAttribute("aria-label", "Copy code");
		button.innerHTML = COPY_ICON;

		button.addEventListener("click", async () => {
			const text = (code.textContent || "").replace(/\n$/, "");
			if (!text) return;

			button.disabled = true;
			try {
				await copyText(text);
				button.innerHTML = CHECK_ICON;
				button.setAttribute("aria-label", "Copied");
			} catch (error) {
				console.error("[copy-code] Failed to copy code:", error);
				button.textContent = "Failed";
			}

			window.setTimeout(() => {
				button.disabled = false;
				button.innerHTML = COPY_ICON;
				button.setAttribute("aria-label", "Copy code");
			}, 1200);
		});

		pre.insertBefore(button, pre.firstChild);
		pre.dataset.copyCodeInitialized = "true";
	};

	window.basecoat?.register("copy-code", "pre:not([data-copy-code-initialized])", initCopyCode);
})();
