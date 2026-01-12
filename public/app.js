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
const personName = "Bạn"; // đổi tên người nhận ở đây
const ASSETS = {
    photos: ["assets/photo1.jpg", "assets/photo2.jpg"],
    video: "assets/video.mp4"
};

// ====== STATE ======
let stepIndex = -1;      // -1: intro
let layerIndex = 0;      // lớp trong step hiện tại

const steps = [
    makeStep1(),
    makeStep2(),
    makeStep3(),
    makeStep4(),
    makeStep5()
];

// ====== INIT ======
renderIntro();

btnPrimary.addEventListener("click", () => advance());
btnReplay.addEventListener("click", () => replay());

document.addEventListener("keydown", (e) => {
    // Enter/Space để mở lớp tiếp theo
    if (e.key === "Enter" || e.key === " ") {
        const activeTag = (document.activeElement && document.activeElement.tagName) || "";
        // tránh can thiệp khi đang focus vào button (space/enter đã là click)
        if (activeTag !== "BUTTON") {
            e.preventDefault();
            advance();
        }
    }
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

    // nếu còn lớp => reveal thêm
    if (layerIndex < step.layers.length - 1) {
        layerIndex++;
        renderStep();
        return;
    }

    // hết lớp => chuyển step tiếp
    if (stepIndex < steps.length - 1) {
        step.onExit?.();
        stepIndex++;
        layerIndex = 0;
        renderStep();
        return;
    }

    // đang ở step cuối => nothing (hoặc confetti lại)
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
}

// ====== RENDER ======
function renderIntro() {
    setProgress(0, "", 0);
    stage.innerHTML = `
    <div class="fade-in">
      <h2>Chuẩn bị mở bất ngờ</h2>
      <p class="note">
        Mỗi “Bước” sẽ có nhiều “Lớp”. Mỗi lần bấm là lộ thêm một lớp nội dung.
        Bạn cũng có thể nhấn Enter/Space.
      </p>
      <div class="pillRow">
        <div class="pill">Bước 1: Lời chúc</div>
        <div class="pill">Bước 2: Ảnh</div>
        <div class="pill">Bước 3: Nhạc</div>
        <div class="pill">Bước 4: Video</div>
        <div class="pill">Bước 5: Thông điệp cuối</div>
      </div>
    </div>
  `;
    btnPrimary.textContent = "Bắt đầu";
}

function renderStep() {
    const step = steps[stepIndex];
    const stepNo = stepIndex + 1;

    // progress theo step
    setProgress(stepNo, step.title, layerIndex + 1, step.layers.length);

    // render: giữ các lớp đã lộ (0..layerIndex)
    const html = step.layers
        .slice(0, layerIndex + 1)
        .map((layerFn, i) => layerFn({ stepNo, layerNo: i + 1 }))
        .join("");

    stage.innerHTML = `
    <div class="fade-in">
      <h2>${escapeHtml(step.title)}</h2>
      ${html}
      <p class="note">
        ${layerIndex < step.layers.length - 1
        ? "Bấm để mở lớp tiếp theo…"
        : (stepIndex < steps.length - 1 ? "Bấm để chuyển sang bước tiếp theo…" : "Hết rồi. Bấm để “mưa pháo giấy” lại.")}
      </p>
    </div>
  `;

    // update button label
    if (stepIndex === steps.length - 1 && layerIndex === step.layers.length - 1) {
        btnPrimary.textContent = "Pháo giấy";
        btnReplay.hidden = false;
    } else {
        btnPrimary.textContent =
            layerIndex < step.layers.length - 1 ? "Mở tiếp" : "Sang bước";
    }

    // hook khi vào step/layer
    step.onEnter?.({ layerIndex, stepIndex });

    // hook theo layer (sau khi DOM có)
    step.onLayerEnter?.(layerIndex);

    // Nếu step muốn tự động ẩn button Primary ở một số layer thì có thể làm trong onLayerEnter
}

// ====== PROGRESS UI ======
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

// ====== STEPS DEFINITIONS (Layered reveal) ======
function makeStep1() {
    return {
        title: "Bước 1: Lời chúc mở dần",
        layers: [
            () => `
        <div class="note fade-in">
          Có một phong bì nhỏ gửi tới <strong>${escapeHtml(personName)}</strong>…
        </div>
      `,
            () => `
        <div class="note fade-in">
          Chúc bạn sinh nhật thật vui. Hôm nay là ngày bạn xứng đáng được ưu tiên nhất.
        </div>
      `,
            () => `
        <div class="note fade-in">
          Mình chuẩn bị vài điều nhỏ: ảnh, nhạc, video và một thông điệp cuối.
          Mỗi lần bấm là mở thêm một lớp.
        </div>
      `
        ]
    };
}

function makeStep2() {
    return {
        title: "Bước 2: Ảnh lộ dần theo lớp",
        layers: [
            () => `
        <div class="note fade-in">
          Trước khi xem ảnh… đoán thử: hôm nay bạn muốn nhận điều gì nhất?
        </div>
      `,
            () => `
        <div class="note fade-in">
          Gợi ý: có 2 tấm ảnh. Mỗi tấm đi kèm một caption nhỏ.
        </div>
      `,
            () => `
        <div class="fade-in">
          <div class="grid2">
            <figure>
              <img class="photo" src="${ASSETS.photos[0]}" alt="Photo 1" />
              <figcaption class="note" style="margin-top:10px;">Caption 1: Khoảnh khắc này đáng nhớ vì bạn đã cười rất thật.</figcaption>
            </figure>
            <figure>
              <img class="photo" src="${ASSETS.photos[1]}" alt="Photo 2" />
              <figcaption class="note" style="margin-top:10px;">Caption 2: Một ngày bình thường nhưng có bạn thì thành đặc biệt.</figcaption>
            </figure>
          </div>
        </div>
      `
        ]
    };
}

function makeStep3() {
    return {
        title: "Bước 3: Nhạc + hiệu ứng",
        onEnter: () => {},
        onLayerEnter: (idx) => {
            // Ở lớp 3 (index 2) mới bật nút play để người dùng chủ động
            if (idx === 2) wireMusicControls();
        },
        layers: [
            () => `
        <div class="note fade-in">
          Giờ thêm một chút không khí: nhạc nền.
        </div>
      `,
            () => `
        <div class="note fade-in">
          Lưu ý: trình duyệt thường yêu cầu tương tác để phát nhạc.
          Ở lớp tiếp theo bạn sẽ có nút bật nhạc.
        </div>
      `,
            () => `
        <div class="glow fade-in" id="musicPanel">
          <p class="note">
            Bấm “Bật nhạc” để phát. Nếu không muốn, bấm “Bỏ qua”.
          </p>
          <div style="display:flex; gap:10px; justify-content:center;">
            <button class="btn primary" id="btnPlayMusic">Bật nhạc</button>
            <button class="btn" id="btnSkipMusic">Bỏ qua</button>
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
    });
}

function makeStep4() {
    return {
        title: "Bước 4: Video mở theo lớp",
        layers: [
            () => `
        <div class="note fade-in">
          Tiếp theo là một đoạn video. Nhưng mình sẽ “bật mí” từ từ.
        </div>
      `,
            () => `
        <div class="note fade-in">
          Mẹo: nếu video là lời chúc tự quay hoặc tổng hợp ảnh, cảm xúc sẽ mạnh hơn rất nhiều.
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
        title: "Bước 5: Thông điệp cuối (typing + confetti)",
        onLayerEnter: (idx) => {
            // lớp 2: typing
            if (idx === 1) startTyping();
            // lớp 3: confetti
            if (idx === 2) burstConfetti();
        },
        layers: [
            () => `
        <div class="note fade-in">
          Trước khi kết thúc… có một điều mình muốn nói thật chậm.
        </div>
      `,
            () => `
        <div class="note fade-in">
          <div id="typing" class="typing"></div><span class="cursor">|</span>
        </div>
      `,
            () => `
        <div class="note fade-in">
          <strong>Happy Birthday, ${escapeHtml(personName)}!</strong>
          Chúc bạn luôn được yêu thương, bình an và gặp thật nhiều điều tốt đẹp.
        </div>
      `
        ]
    };
}

function startTyping() {
    const el = document.getElementById("typing");
    if (!el) return;

    const text =
        `Chúc mừng sinh nhật, ${personName}.

Chúc bạn một tuổi mới thật nhiều niềm vui, sức khỏe và những ngày nhẹ nhàng.
Mong mọi dự định của bạn đều tiến triển tốt, và mỗi ngày đều có lý do để mỉm cười.

Cảm ơn vì đã xuất hiện và làm cuộc sống trở nên đáng nhớ hơn.`;

    typeText(el, text, 16);
}

// ====== typing helper ======
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

// ====== confetti (canvas) ======
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

// ====== utils ======
function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}