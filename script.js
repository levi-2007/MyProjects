// তোর Firebase Realtime Database URL
const FIREBASE_URL = "https://url-shortner-b6d8a-default-rtdb.firebaseio.com/";

// ১. পেজ লোড হলে শর্ট কোড রিডাইরেক্ট হ্যান্ডেল করা (?r=...)
window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("r");

  if (code) {
    document.body.innerHTML = `
      <div style="text-align: center; margin-top: 60px; font-family: sans-serif; color: #fff;">
        <h2>Redirecting to destination...</h2>
        <p>Please wait a moment.</p>
      </div>
    `;

    try {
      const response = await fetch(`${FIREBASE_URL}links/${code}.json`);
      const originalUrl = await response.json();

      if (originalUrl) {
        window.location.href = originalUrl;
      } else {
        document.body.innerHTML = `
          <div style="text-align: center; margin-top: 60px; font-family: sans-serif; color: #fff;">
            <h2>404 - Link Not Found</h2>
            <p>This shortened link does not exist or has expired.</p>
            <a href="${window.location.origin + window.location.pathname}" style="color: #4da6ff;">Create a new link</a>
          </div>
        `;
      }
    } catch (err) {
      document.body.innerHTML = `<h2 style="color: red; text-align: center; margin-top: 60px;">Database Connection Error!</h2>`;
    }
  }
});

// ২. শর্ট লিঙ্ক জেনারেট করে ডেটাবেসে সেভ করা
async function shortenUrl() {
  const inputUrl = document.getElementById("myUrl");
  const display = document.getElementById("display");
  const submitBtn = document.getElementById("submitBtn");
  const value = inputUrl.value.trim();

  try {
    new URL(value);
  } catch (_) {
    alert("Please enter a valid URL with http:// or https://");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Creating...";

  // ৬ ডিজিটের ইউনিক র‍্যান্ডম স্ট্রিং
  const uniqueId = Math.random().toString(36).substring(2, 8);

  try {
    const response = await fetch(`${FIREBASE_URL}links/${uniqueId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });

    if (response.ok) {
      const baseUrl = window.location.origin + window.location.pathname;
      const shortUrl = `${baseUrl}?r=${uniqueId}`;

      display.innerHTML = `
        <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.08); border-radius: 8px;">
          <p style="margin: 0 0 8px 0;">Shortened Link:</p>
          <a href="${shortUrl}" target="_blank" style="color: #4da6ff; word-break: break-all;">${shortUrl}</a>
          <br><br>
          <button onclick="navigator.clipboard.writeText('${shortUrl}'); alert('Copied to clipboard!')">Copy Link</button>
        </div>
      `;
      inputUrl.value = "";
    } else {
      alert("Failed to save to Firebase.");
    }
  } catch (err) {
    alert("Error saving link to Firebase database.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Shorten";
  }
}