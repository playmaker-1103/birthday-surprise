const stage = document.getElementById("stage");
const btnPrimary = document.getElementById("btnPrimary");
const btnReplay = document.getElementById("btnReplay");

const progressText = document.getElementById("progressText");
const subProgressText = document.getElementById("subProgressText");
const barFill = document.getElementById("barFill");

const bgm = document.getElementById("bgm");

const fx = document.getElementById("fx");
const ctx = fx.getContext("2d");

// ====== TÙY BIẾN ======
const personName = "Như Ý aka Yvonne"; // đổi tên người nhận ở đây
const ASSETS = {
    photos: ["assets/photo1.jpg", "assets/photo2.jpg"],
    video: "assets/video.mp4"
};

// ====== STATE ======
let stepIndex = -1;   // -1: intro
let layerIndex = 0;

const steps = [
    makeStep1(),
    makeStep2(),
    makeStep3(),
    makeStep4(),
    makeStep5()
];

// ====== INIT ======
renderIntro();
applyButtonHint();

btnPrimary.addEventListener("click", () => advance());
btnReplay.addEventListener("click", () => replay());

// Enter/Space để tiến (trừ khi đang focus button)
document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const activeTag = (document.activeElement && document.activeElement.tagName) || "";
    if (activeTag === "BUTTON") return;

    e.preventDefault();
    advance();
});

// ====== CORE: advance reveal ======
function advance() {
    // start
    if (stepIndex === -1) {
        stepIndex = 0;
        layerIndex = 0;
        renderStep();
        return;
    }

    const step = steps[stepIndex];

    // reveal thêm lớp trong cùng bước
    if (layerIndex < step.layers.length - 1) {
        layerIndex++;
        renderStep();
        return;
    }

    // chuyển bước
    if (stepIndex < steps.length - 1) {
        step.onExit?.();
        stepIndex++;
        layerIndex = 0;
        renderStep();
        return;
    }

    // cuối cùng: chỉ hiệu ứng (không text nhắc)
    burstConfetti();
}

function replay() {
    try { bgm.pause(); bgm.currentTime = 0; } catch {}
    clearFx();

    btnReplay.hidden = true;
    btnPrimary.hidden = false;
    btnPrimary.textContent = "Bắt đầu";

    stepIndex = -1;
    layerIndex = 0;

    renderIntro();
    applyButtonHint();
}

// ====== RENDER ======
function renderIntro() {
    setProgress(0, "", 0, 0);
    stage.innerHTML = `
    <div class="fade-in">
      <h2>Chuẩn bị</h2>
      <p class="note">
        Một trang nhỏ. Nội dung sẽ mở dần theo từng lớp.
      </p>
    </div>
  `;
}

function renderStep() {
    const step = steps[stepIndex];
    const stepNo = stepIndex + 1;

    setProgress(stepNo, step.title, layerIndex + 1, step.layers.length);

    // render các lớp đã lộ
    const html = step.layers
        .slice(0, layerIndex + 1)
        .map((layerFn, i) => layerFn({ stepNo, layerNo: i + 1 }))
        .join("");

    stage.innerHTML = `
    <div class="fade-in">
      <h2>${escapeHtml(step.title)}</h2>
      ${html}
    </div>
  `;

    // label button (không có lời nhắc)
    const isLastLayer = layerIndex === step.layers.length - 1;
    const isLastStep = stepIndex === steps.length - 1;

    if (isLastStep && isLastLayer) {
        btnPrimary.textContent = "Pháo giấy";
        btnReplay.hidden = false;
    } else {
        btnPrimary.textContent = isLastLayer ? "Tiếp" : "Mở";
    }

    step.onEnter?.({ layerIndex, stepIndex });
    step.onLayerEnter?.(layerIndex);

    applyButtonHint();
}

function setProgress(stepNo, stepTitle, layerNo = 0, layerTotal = 0) {
    const totalSteps = steps.length;
    progressText.textContent = `Bước ${stepNo}/${totalSteps}${stepTitle ? ` — ${stepTitle}` : ""}`;
    barFill.style.width = `${(stepNo / totalSteps) * 100}%`;

    if (layerTotal > 0) {
        subProgressText.textContent = `Lớp ${layerNo}/${layerTotal}`;
    } else {
        subProgressText.textContent = "";
    }
}

function applyButtonHint() {
    btnPrimary.classList.remove("hint");

    // pulse nhẹ khi còn nội dung để tiến
    if (stepIndex === -1) {
        btnPrimary.classList.add("hint");
        return;
    }

    const step = steps[stepIndex];
    const canAdvance =
        (layerIndex < step.layers.length - 1) ||
        (stepIndex < steps.length - 1);

    if (canAdvance) btnPrimary.classList.add("hint");
}

// ====== STEPS (Layered) ======
function makeStep1() {
    return {
        title: "Lời chúc đầu tiên",
        layers: [
            () => `
        <div class="note fade-in">
          Gửi tới <strong>${escapeHtml(personName)}</strong>.
        </div>
      `,
            () => `
        <div class="note fade-in">
          Chúc em gái sinh nhật thật vui, nhẹ nhàng, và đúng theo cách em muốn.
        </div>
      `,
            () => `
        <div class="note fade-in">
          Anh làm cái web nho nhỏ coi như lời chúc sinh nhật
        </div>
      `
        ]
    };
}

function makeStep2() {
    return {
        title: "Những bức ảnh anh nghĩ là đẹp",
        layers: [
            () => `
        <div class="note fade-in">
          Anh cố tìm ảnh cười nhưng mà ít nguồn quá
        </div>
      `,
            () => `
        <div class="note fade-in">
          nên là anh chọn 2 cái ảnh này(toàn trên locket)
        </div>
      `,
            () => `
        <div class="fade-in">
          <div class="grid2">
            <figure>
              <img class="photo" src="assets/IMG_7052.jpg" alt="Photo 1" />
              <figcaption class="note" style="margin-top:10px;">
                Tấm ảnh cười duy nhất
              </figcaption>
            </figure>
            <figure>
              <img class="photo" src="/assets/IMG_7053.jpg" alt="Photo 2" />
              <figcaption class="note" style="margin-top:10px;">
                Sinh nhật nên được đội vương miện
              </figcaption>
            </figure>
          </div>
        </div>
      `
        ]
    };
}

function makeStep3() {
    return {
        title: "Làm tí music",
        onLayerEnter: (idx) => {
            if (idx === 2) wireMusicControls();
        },
        layers: [
            () => `
        <div class="note fade-in">
          Biết em fan Jennie
        </div>
      `,
            () => `
        <div class="note fade-in">
          Nên tuổi mới hãy "like Jennie" nhé
        </div>
      `,
            () => `
        <div class="glow fade-in" id="musicPanel">
          <div style="display:flex; gap:10px; justify-content:center;">
            <button class="btn primary" id="btnPlayMusic">Bật nhạc</button>
            <button class="btn" id="btnSkipMusic">Tắt</button>
          </div>
        </div>
      `
        ]
    };
}

function wireMusicControls() {
    const panel = document.getElementById("musicPanel");
    const btnPlay = document.getElementById("btnPlayMusic");
    const btnSkip = document.getElementById("btnSkipMusic");
    if (!panel || !btnPlay || !btnSkip) return;

    btnPlay.addEventListener("click", async () => {
        try {
            bgm.loop = true;
            bgm.volume = 0.85;
            await bgm.play();
            panel.classList.add("playing");
            btnPlay.textContent = "Đang phát";
            btnPlay.disabled = true;
        } catch {
            alert("Không thể phát nhạc. Hãy kiểm tra assets/music.mp3 hoặc quyền autoplay.");
        }
    });

    btnSkip.addEventListener("click", () => {
        try { bgm.pause(); bgm.currentTime = 0; } catch {}
        panel.classList.remove("playing");
        btnPlay.disabled = false;
        btnPlay.textContent = "Bật nhạc";
    });
}

function makeStep4() {
    return {
        title: "Limited",
        layers: [
            () => `
        <div class="note fade-in">
          Không biết chèn gì nên cho một thứ duy nhất anh có mà không ai có
        </div>
      `,
            () => `
        <div class="note fade-in">
          Anh đã chọn lọc kĩ lưỡng tìm cái video cười nhiều nhất
        </div>
      `,
            () => `
        <div class="fade-in">
          <div class="cinema">
            <video controls preload="metadata" src="${ASSETS.video}">
              Trình duyệt không hỗ trợ video.
            </video>
          </div>
        </div>
      `
        ]
    };
}

function makeStep5() {
    return {
        title: "Lời chúc cuối",
        onLayerEnter: (idx) => {
            if (idx === 1) startTyping();
            if (idx === 2) burstConfetti();
        },
        layers: [
            () => `
        <div class="note fade-in">
          Trước khi kết thúc.
        </div>
      `,
            () => `
        <div class="note fade-in">
          <div id="typing" class="typing"></div><span class="cursor">|</span>
        </div>
      `,
            () => `
        <div class="note fade-in">
          <strong>Happy Birthday, Như íiiii.</strong><br/>
          Chúc em luôn xinh gái và thành công
        </div>
      `
        ]
    };
}

function startTyping() {
    const el = document.getElementById("typing");
    if (!el) return;

    const text =
        `Chúc mừng sinh nhật, Như íiiii.

Chúc em 8386 mãi đỉnh mãi đỉnh mãi đỉnh
Cảm ơn vì đã xuất hiện và làm nhà 69 trở lên sinh động hơn.`;

    typeText(el, text, 16);
}

function typeText(el, text, speedMs = 16) {
    el.textContent = "";
    let i = 0;

    function tick() {
        i++;
        el.textContent = text.slice(0, i);
        if (i < text.length) setTimeout(tick, speedMs);
    }
    tick();
}

// ====== CONFETTI (canvas) ======
function resizeFx() {
    fx.width = window.innerWidth;
    fx.height = window.innerHeight;
}
window.addEventListener("resize", resizeFx);
resizeFx();

function clearFx() {
    ctx.clearRect(0, 0, fx.width, fx.height);
}

function burstConfetti() {
    const pieces = [];
    const count = 200;

    for (let i = 0; i < count; i++) {
        pieces.push({
            x: Math.random() * fx.width,
            y: -20 - Math.random() * 240,
            vx: (Math.random() - 0.5) * 3.2,
            vy: 2.2 + Math.random() * 4.8,
            size: 3 + Math.random() * 6,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.22,
            life: 150 + Math.random() * 90
        });
    }

    let frame = 0;
    function tick() {
        frame++;
        ctx.clearRect(0, 0, fx.width, fx.height);

        pieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vr;
            p.life -= 1;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 140));
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        for (let i = pieces.length - 1; i >= 0; i--) {
            if (pieces[i].life <= 0 || pieces[i].y > fx.height + 60) pieces.splice(i, 1);
        }

        if (pieces.length > 0 && frame < 360) requestAnimationFrame(tick);
        else clearFx();
    }
    tick();
}

// ====== UTILS ======
function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}