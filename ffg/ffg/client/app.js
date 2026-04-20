const API = "http://localhost:5000";

// --- UI Utilities ---
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = type === "success" ? "#10b981" : "#ef4444";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// --- API Functions ---
async function createPost() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const category = document.getElementById("category").value;

  if (!title || !content) {
    showToast("Please fill in all fields", "error");
    return;
  }

  try {
    const btn = document.querySelector(".btn-primary");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;margin:0"></div>';

    const res = await fetch(`${API}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category })
    });

    if (res.ok) {
      document.getElementById("title").value = "";
      document.getElementById("content").value = "";
      showToast("Post published successfully! ✨");
      loadPosts();
    } else {
      throw new Error("Failed to create post");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    const btn = document.querySelector(".btn-primary");
    btn.disabled = false;
    btn.innerHTML = '<span>Publish Post</span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  }
}

async function loadPosts() {
  const container = document.getElementById("posts-container");
  
  try {
    const res = await fetch(`${API}/posts`);
    const posts = await res.json();

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="card glass" style="text-align: center; padding: 4rem;">
          <h2 style="color: var(--text-muted)">No insights yet</h2>
          <p>Be the first to share something amazing!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = posts.map(p => `
      <article class="post-card">
        <div class="post-meta">
          <span class="post-category">${p.category}</span>
          <span class="post-date">${formatDate(p.createdAt)}</span>
        </div>
        <h3 class="post-title">${p.title}</h3>
        <p class="post-content">${p.content}</p>
        
        <div class="comments-section">
          <div class="comment-input-wrap">
            <input type="text" placeholder="Share your throughs on this..." id="c-${p._id}">
            <button class="comment-btn" onclick="addComment('${p._id}')">Send</button>
          </div>
          <div id="comments-${p._id}" class="comments-list">
            <!-- Comments loaded dynamically -->
          </div>
        </div>
      </article>
    `).join("");

    // Load comments for each post
    posts.forEach(p => loadComments(p._id));

  } catch (error) {
    container.innerHTML = `<p style="color: #ef4444; text-align: center;">Error loading posts. Please check if the server is running.</p>`;
  }
}

async function loadComments(postId) {
  const div = document.getElementById(`comments-${postId}`);
  
  try {
    const res = await fetch(`${API}/posts/${postId}`);
    const data = await res.json();

    if (data.comments && data.comments.length > 0) {
      div.innerHTML = data.comments.map(c => `
        <div class="comment-item">
          <div class="comment-avatar">👤</div>
          <div class="comment-text">${c.text}</div>
        </div>
      `).join("");
    } else {
      div.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-muted); opacity: 0.5;">No comments yet.</p>';
    }
  } catch (error) {
    console.error("Error loading comments:", error);
  }
}

async function addComment(postId) {
  const input = document.getElementById(`c-${postId}`);
  const text = input.value.trim();

  if (!text) return;

  try {
    const res = await fetch(`${API}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, text })
    });

    if (res.ok) {
      input.value = "";
      loadComments(postId);
      showToast("Comment added!");
    }
  } catch (error) {
    showToast("Failed to add comment", "error");
  }
}

// Initial Load
window.addEventListener("DOMContentLoaded", () => {
  loadPosts();
});
