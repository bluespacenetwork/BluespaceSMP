const JAVA_IP = "bsc.skilloraclouds.site:20001";
const BEDROCK_IP = "bsc.skilloraclouds.site:20001";
const STATUS_API = "https://api.mcsrvstat.us/3/bsc.skilloraclouds.site:20001";

function copyText(text, message) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast(message));
        return;
    }

    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    showToast(message);
}

function copyJavaIP() {
    copyText(JAVA_IP, "Java IP copied!");
}

function copyBedrockIP() {
    copyText(BEDROCK_IP, "Bedrock IP copied!");
}

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

async function loadServer() {
    const status = document.getElementById("status");
    const players = document.getElementById("players");
    const version = document.getElementById("version");
    const ping = document.getElementById("ping");

    if (!status || !players || !version || !ping) {
        return;
    }

    try {
        const response = await fetch(STATUS_API);

        if (!response.ok) {
            throw new Error("Status request failed");
        }

        const data = await response.json();

        if (data.online) {
            status.textContent = "Online";
            players.textContent = `${data.players?.online ?? 0} / ${data.players?.max ?? "?"}`;
            version.textContent = data.version || "Available";
            ping.textContent = data.debug?.ping ? `${data.debug.ping} ms` : "Available";
            return;
        }

        status.textContent = "Offline";
        players.textContent = "-";
        version.textContent = "-";
        ping.textContent = "-";
    } catch (error) {
        status.textContent = "Status unavailable";
        players.textContent = "-";
        version.textContent = "-";
        ping.textContent = "-";
        console.error(error);
    }
}

function revealSections() {
    const sections = document.querySelectorAll("section");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, {
        threshold: 0.12
    });

    sections.forEach((section) => {
        section.classList.add("hidden");
        observer.observe(section);
    });
}

function initGallery() {
    const preview = document.getElementById("galleryPreview");
    const items = document.querySelectorAll(".gallery-item");

    if (!preview || !items.length) {
        return;
    }

    items.forEach((item) => {
        item.addEventListener("click", () => {
            items.forEach((button) => button.classList.remove("active"));
            item.classList.add("active");
            preview.src = item.dataset.image;
        });
    });
}

function initAnimations() {
    if (!window.gsap || !window.ScrollTrigger) {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const transitionImage = document.querySelector(".transition-image");

    if (transitionImage) {
        gsap.timeline({
            scrollTrigger: {
                trigger: ".transition",
                start: "top top",
                end: "+=150%",
                pin: true,
                scrub: 1,
                anticipatePin: 1
            }
        })
            .fromTo(transitionImage, {
                rotateX: 70,
                rotateY: -20,
                scale: .7,
                opacity: 0
            }, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                opacity: 1
            })
            .to(transitionImage, {
                scale: 1.12,
                duration: 1
            });

        gsap.to(transitionImage, {
            y: 20,
            repeat: -1,
            yoyo: true,
            duration: 3,
            ease: "sine.inOut"
        });

        document.addEventListener("mousemove", (event) => {
            if (window.innerWidth < 900) {
                return;
            }

            const x = (window.innerWidth / 2 - event.clientX) / 55;
            const y = (window.innerHeight / 2 - event.clientY) / 55;

            gsap.to(transitionImage, {
                rotateY: x,
                rotateX: -y,
                duration: .6
            });
        });
    }

    gsap.to(".transition-overlay", {
        opacity: 1,
        duration: 1,
        scrollTrigger: {
            trigger: ".transition",
            start: "top 60%",
            end: "center center",
            scrub: true
        }
    });

    gsap.from(".server-status h2", {
        opacity: 0,
        y: 80,
        duration: 1,
        scrollTrigger: {
            trigger: ".server-status",
            start: "top 80%"
        }
    });

    gsap.from(".card", {
        y: 70,
        opacity: 0,
        stagger: .1,
        duration: .9,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".features",
            start: "top 80%"
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadServer();
    revealSections();
    initGallery();
    initAnimations();

    window.setInterval(loadServer, 60000);
});
