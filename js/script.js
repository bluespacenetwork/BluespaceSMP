const JAVA_IP = "play.bluespacecraft.fun";
const BEDROCK_IP = "paid17.skilloraclouds.site:20019";
const STATUS_API = "https://api.mcsrvstat.us/3/play.bluespacecraft.fun:20019";
const OFFICIALS = [
    {
        name: "ATRAPomegranate",
        ign: "ATRAPomegranate",
        skin: "images/skin/ATRAPomegranate.png"
    },
    {
        name: "cececeh",
        ign: "cececeh",
        skin: "images/skin/cececeh.png"
    },
    {
        name: "Thor_Advait",
        ign: "Thor_Advait",
        skin: "images/skin/Thor_Advait.png"
    },
    {
        name: "Wanzy_",
        ign: "Wanzy_",
        skin: "images/skin/Wanzy_.png"
    },
    {
        name: "PrismGlow",
        ign: "PrismGlow",
        skin: "images/skin/PrismGlow.png"
    },
    {
        name: "CryptexDev",
        ign: "CryptexDev",
        skin: "images/skin/CryptexDev.png"
    }
];

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

function buildOfficialCard(official) {
    const card = document.createElement("article");
    card.className = "official-card";
    card.innerHTML = `
        <div class="official-skin-stage">
            <canvas class="official-skin-canvas" aria-label="${official.ign} 3D Minecraft skin"></canvas>
            <div class="skin-fallback">Add <strong>${official.ign}.png</strong> inside <strong>images/skin</strong> to show this 3D skin.</div>
        </div>
        <span class="official-role">Official</span>
        <h3>${official.name}</h3>
        <p>In-game name: <strong>${official.ign}</strong></p>
    `;

    return card;
}

function initOfficialSkins() {
    const grid = document.getElementById("officialsGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML = "";
    window.officialSkinViewers = [];

    OFFICIALS.forEach((official) => {
        const card = buildOfficialCard(official);
        const canvas = card.querySelector(".official-skin-canvas");
        const stage = card.querySelector(".official-skin-stage");

        grid.appendChild(card);

        if (!window.skinview3d?.SkinViewer) {
            card.classList.add("skin-library-missing");
            return;
        }

        const width = Math.max(210, Math.min(270, stage.clientWidth || 240));
        const height = 315;

        try {
            const viewer = new skinview3d.SkinViewer({
                canvas,
                width,
                height
            });

            viewer.loadSkin(official.skin).catch(() => {
                card.classList.add("skin-missing");
            });

            viewer.zoom = .82;
            viewer.fov = 55;
            viewer.controls.enableRotate = true;
            viewer.controls.enableZoom = false;
            viewer.controls.enablePan = false;
            viewer.animation = new skinview3d.WalkingAnimation();
            viewer.animation.speed = .55;

            if (viewer.playerObject) {
                viewer.playerObject.rotation.y = .35;
            }

            window.officialSkinViewers.push({ viewer, stage });
        } catch (error) {
            card.classList.add("skin-library-missing");
            console.error(error);
        }
    });
}

function resizeOfficialSkins() {
    if (!window.officialSkinViewers?.length) {
        return;
    }

    window.officialSkinViewers.forEach(({ viewer, stage }) => {
        if (!viewer.setSize) {
            return;
        }

        const width = Math.max(210, Math.min(270, stage.clientWidth || 240));
        viewer.setSize(width, 315);
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

    gsap.from(".official-card", {
        y: 70,
        opacity: 0,
        stagger: .1,
        duration: .9,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".officials",
            start: "top 80%"
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadServer();
    revealSections();
    initGallery();
    initOfficialSkins();
    initAnimations();

    window.setInterval(loadServer, 60000);
});

window.addEventListener("resize", resizeOfficialSkins);
