const elements = {
  video: document.getElementById("video"),
  canvas: document.getElementById("canvas"),
  btnStartCamera: document.getElementById("btnStartCamera"),
  btnCapture: document.getElementById("btnCapture"),
  btnReset: document.getElementById("btnReset"),
  btnLookup: document.getElementById("btnLookup"),
  fullName: document.getElementById("fullName"),
  rollNumber: document.getElementById("rollNumber"),
  departmentName: document.getElementById("departmentName"),
  section: document.getElementById("section"),
  backendUrl: document.getElementById("backendUrl"),
  statusText: document.getElementById("statusText"),
  studentProfile: document.getElementById("studentProfile"),
  captureCount: document.getElementById("captureCount"),
  lastFrameState: document.getElementById("lastFrameState"),
  connectionState: document.getElementById("connectionState"),
  embeddingState: document.getElementById("embeddingState"),
  captureStrip: document.getElementById("captureStrip"),
  cameraHint: document.getElementById("cameraHint"),
  btnSubmit: document.getElementById("btnSubmit")
};

const state = {
  stream: null,
  captures: [],
  analyzerUrl: "http://localhost:5001/analyze",
  latestEmbedding: null,
  latestSampleCount: 0,
  studentId: null
};

elements.backendUrl.value = "http://localhost:4000/api";

function setStatus(message) {
  elements.statusText.textContent = message;
}

function setStudentProfile(student) {
  state.studentId = student?.student_id ?? student?.studentId ?? null;
  elements.studentProfile.textContent = student
    ? `Roll Number: ${student.roll_number ?? student.rollNumber ?? ""}\nName: ${student.full_name ?? student.fullName ?? ""}\nDepartment: ${student.department_name ?? student.departmentName ?? ""}\nSection: ${student.section ?? ""}`
    : "Student details will appear here.";
}

function getApiBase() {
  return elements.backendUrl.value.trim().replace(/\/$/, "");
}

async function startCamera() {
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    elements.video.srcObject = state.stream;
    elements.cameraHint.textContent = "Camera active. Capture a frame when you are ready.";
    setStatus("Camera started successfully.");
  } catch (error) {
    setStatus(`Camera error: ${error.message}`);
    elements.cameraHint.textContent = "Browser camera permission is required.";
  }
}

function captureFrame() {
  if (!elements.video.videoWidth) {
    setStatus("Start the camera first.");
    return;
  }

  elements.canvas.width = elements.video.videoWidth;
  elements.canvas.height = elements.video.videoHeight;
  const context = elements.canvas.getContext("2d");
  context.drawImage(elements.video, 0, 0, elements.canvas.width, elements.canvas.height);
  const imageUrl = elements.canvas.toDataURL("image/png");
  state.captures.unshift(imageUrl);
  state.captures = state.captures.slice(0, 6);
  renderCaptures();
  elements.captureCount.textContent = String(state.captures.length);
  elements.lastFrameState.textContent = "Captured";
  setStatus("Frame captured. Sending it to the Python analyzer...");
  analyzeFrame(imageUrl)
    .then((result) => {
      elements.connectionState.textContent = "Analyzer connected";
      state.latestEmbedding = result.embedding || null;
      state.latestSampleCount = state.captures.length;
      elements.embeddingState.textContent = result.hasEmbedding ? "Embedding ready." : "No face encoding found.";
      setStatus(
        `Faces: ${result.faceCount}, Blur: ${Math.round(result.blurScore)}, Brightness: ${Math.round(result.brightness)}`
      );
    })
    .catch((error) => {
      elements.connectionState.textContent = "Analyzer error";
      setStatus(error.message);
    });
}

async function analyzeFrame(imageDataUrl) {
  const response = await fetch(state.analyzerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageDataUrl })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Analysis failed");
  }

  return payload;
}

function renderCaptures() {
  elements.captureStrip.innerHTML = state.captures
    .map((src, index) => `<img src="${src}" alt="Capture ${index + 1}" />`)
    .join("");
}

async function lookupStudent() {
  const rollNumber = elements.rollNumber.value.trim();
  if (!rollNumber) {
    setStatus("Enter a roll number first.");
    return;
  }

  const response = await fetch(`${getApiBase()}/enrollment/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rollNumber })
  });

  const payload = await response.json();
  if (!response.ok) {
    setStudentProfile(null);
    elements.connectionState.textContent = "Lookup failed";
    setStatus(payload.message || "Student lookup failed.");
    return;
  }

  elements.connectionState.textContent = "Connected";
  setStudentProfile(payload.student);
  elements.fullName.value = payload.student.full_name || payload.student.fullName || elements.fullName.value;
  elements.departmentName.value = payload.student.department_name || payload.student.departmentName || elements.departmentName.value;
  elements.section.value = payload.student.section || elements.section.value;
  setStatus("Student found and profile loaded.");
}

async function submitEnrollment() {
  const rollNumber = elements.rollNumber.value.trim();
  if (!rollNumber) {
    setStatus("Enter a roll number first.");
    return;
  }

  if (!state.latestEmbedding) {
    setStatus("Capture a frame with a visible face first.");
    return;
  }

  const response = await fetch(`${getApiBase()}/enrollment/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rollNumber,
      studentId: state.studentId || undefined,
      fullName: elements.fullName.value.trim() || undefined,
      departmentName: elements.departmentName.value.trim() || undefined,
      section: elements.section.value.trim() || undefined,
      embedding: state.latestEmbedding,
      sampleCount: state.latestSampleCount,
      referenceImages: state.captures.map((_, index) => `${rollNumber}_${index + 1}.png`),
      capturedImages: state.captures.map((capture, index) => ({
        fileName: `${rollNumber}_${index + 1}.png`,
        dataUrl: capture
      })),
      metadata: {
        source: "web-ui",
        captured_frames: state.captures.length
      }
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Enrollment upload failed");
  }

  setStatus("Enrollment completed successfully.");
  elements.connectionState.textContent = "Uploaded";
}

function resetForm() {
  elements.fullName.value = "";
  elements.rollNumber.value = "";
  elements.departmentName.value = "";
  elements.section.value = "";
  state.captures = [];
  state.latestEmbedding = null;
  state.latestSampleCount = 0;
  state.studentId = null;
  renderCaptures();
  elements.captureCount.textContent = "0";
  elements.lastFrameState.textContent = "Idle";
  setStudentProfile(null);
  elements.embeddingState.textContent = "No embedding yet.";
  setStatus("Session reset.");
}

elements.btnStartCamera.addEventListener("click", startCamera);
elements.btnCapture.addEventListener("click", captureFrame);
elements.btnLookup.addEventListener("click", lookupStudent);
elements.btnSubmit.addEventListener("click", () => {
  submitEnrollment().catch((error) => setStatus(error.message));
});
elements.btnReset.addEventListener("click", resetForm);

setStatus("Ready. Fill in the details and start the camera.");
