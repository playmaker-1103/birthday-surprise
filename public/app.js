const stage = document.getElementById("stage");
const btnPrimary = document.getElementById("btnPrimary");
const btnReplay = document.getElementById("btnReplay");
const bgm = document.getElementById("bgm");
const fx = document.getElementById("fx");
const ctx = fx.getContext("2d");

let stepIndex = -1;

// Bạn thay nội dung ở đây theo người nhận
const personName = "Bạn"; // ví dụ: "Linh"
const steps = [
    {
        key: "wish",
        title: `Chúc mừng sinh nhật, ${personName}!`,
        html: `
      <div class="fade-in">
        <h2>🎂 Bước 1: Lời chúc đầu tiên</h2>
        <p class="note">
          Chúc bạn một tuổi mới thật nhiều niềm vui, sức khỏe và những điều ấm áp.
          Hôm nay mình chuẩn bị vài bất ngờ nhỏ — mỗi lần bấm là mở thêm một món.
        </p>
        <p class="note">Nhấn “Tiếp tục” để mở quà nhé.</p>
      </div>
    `,
        onEnter: () => {}
    },
    {
        key: "photo",
        title: "Một tấm ảnh để nhớ",
        html: `
      <div class="fade-in">
        <h2>📸 Bước 2: Ảnh kỷ niệm</h2>
        <div class="grid2">
          <img class="photo" src="assets/photo1.jpg" alt="Photo 1" />
          <img class="photo" src="assets/photo2.jpg" alt="Photo 2" />
        </div>
        <p class="note">
          Mỗi bức ảnh là một khoảnh khắc đáng giá. Cảm ơn vì đã xuất hiện trong hành trình này.
        </p>
      </div>
    `,
        onEnter: () => {}
    },
    {
        key: "music",
        title: "Bật nhạc lên",
        html: `
      <div class="fade-in">
        <h2>🎵 Bước 3: Nhạc nền</h2>
        <p class="note">
          Bấm nút dưới đây để bật nhạc (trình duyệt thường yêu cầu tương tác người dùng để play).
        </p>
        <button id="btnPlayMusic" class="btn primary">Bật nhạc</button>
        <p class="note" style="margin-top:10px">
          Gợi ý: bạn có thể chọn một bài “signature” của hai người hoặc bài mà người ấy thích.
        </p>
      </div>
    `,
        onEnter: () => {
            // gắn handler sau khi render
            setTimeout(() => {
                const btnPlay = document.getElementById("btnPlayMusic");
                if (!btnPlay) return;

                btnPlay.addEventListener("click", async () => {
                    try {
                        bgm.loop = true;
                        bgm.volume = 0.85;
                        await bgm.play();
                        btnPlay.textContent = "Đang phát";
                        btnPlay.disabled = true;
                    } catch (e) {
                        alert("Không thể phát nhạc. Kiểm tra file assets/music.mp3 hoặc quyền autoplay của trình duyệt.");
                    }
                });
            }, 0);
        }
    },
    {
        key: "video",
        title: "Một đoạn video",
        html: `
      <div class="fade-in">
        <h2>🎬 Bước 4: Video</h2>
        <video
          controls
          preload="metadata"
          style="width:100%; border-radius:14px; border:1px solid rgba(255,255,255,0.12);"
          src="assets/video.mp4">
          Trình duyệt không hỗ trợ video.
        </video>
        <p class="note">
          Bạn có thể thay video.mp4 bằng video tổng hợp kỷ niệm hoặc lời chúc bạn tự quay.
        </p>
      </div>
    `,
        onEnter: () => {}
    },
    {
        key: "final",
        title: "Thông điệp cuối",
        html: `
      <div class="fade-in">
        <h2>✨ Bước 5: Điều mình muốn nói</h2>
        <p class="note">
          Chúc bạn luôn được yêu thương, được là chính mình, và gặp thật nhiều may mắn trong năm mới.
          Nếu hôm nay có một điều chắc chắn, thì đó là: bạn xứng đáng với những điều tốt đẹp nhất.
        </p>
        <p class="note"><strong>Happy Birthday!</strong></p>
      </div>
    `,
        onEnter: () => {
            burstConfetti();
            btnPrimary.hidden = true;
            btnReplay.hidden = false;
        }
    }
];

function renderStep(i) {
    const step = steps[i];
    stage.innerHTML = step.html;

    // cập nhật nút
    if (i < steps.length - 1) {
        btnPrimary.textContent = i === -1 ? "Bắt đầu" : "Tiếp tục";
    } else {
        btnPrimary.textContent = "Hoàn tất";
    }

    step.onEnter?.();
}

btnPrimary.addEventListener("click", () => {
    stepIndex = Math.min(stepIndex + 1, steps.length - 1);
    renderStep(stepIndex);
});

btnReplay.addEventListener("click", () => {
    stepIndex = 0;
    btnPrimary.hidden = false;
    btnReplay.hidden = true;
    try { bgm.pause(); bgm.currentTime = 0; } catch {}
    renderStep(stepIndex);
});

// initial
stage.innerHTML = `
  <div class="fade-in">
    <h2>📩 Nhấn “Bắt đầu” để mở phong bì</h2>
    <p class="note">Mỗi lần bấm là một bất ngờ mới. Chuẩn bị tinh thần nhé.</p>
  </div>
`;

// ====== Confetti tối giản (canvas) ======
function resizeFx() {
    fx.width = window.innerWidth;
    fx.height = window.innerHeight;
}
window.addEventListener("resize", resizeFx);
resizeFx();

function burstConfetti() {
    const pieces = [];
    const count = 180;
    for (let i = 0; i < count; i++) {
        pieces.push({
            x: Math.random() * fx.width,
            y: -20 - Math.random() * 200,
            vx: (Math.random() - 0.5) * 3.2,
            vy: 2 + Math.random() * 4.6,
            size: 3 + Math.random() * 6,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.2,
            life: 140 + Math.random() * 70
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
            ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 120));
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        // loại bỏ piece chết
        for (let i = pieces.length - 1; i >= 0; i--) {
            if (pieces[i].life <= 0 || pieces[i].y > fx.height + 50) pieces.splice(i, 1);
        }

        if (pieces.length > 0 && frame < 320) {
            requestAnimationFrame(tick);
        } else {
            ctx.clearRect(0, 0, fx.width, fx.height);
        }
    }
    tick();
}