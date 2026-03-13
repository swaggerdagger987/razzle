
fetch("/api/analytics/pageview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({page:location.pathname})}).catch(function(){});

// Trial expiry banner logic
(function() {
  var banner = document.getElementById("trialExpiryBanner");
  if (!banner) return;
  try {
    var user = JSON.parse(localStorage.getItem("razzle_user") || "null");
    if (!user) return;

    // Skip for paid subscribers and lifetime users
    var plan = user.plan || "free";
    if (plan !== "free" && user.plan_source !== "trial") return;
    if (plan === "pro_lifetime" || plan === "elite_lifetime") return;

    var isTrial = user.trial_active && user.plan_source === "trial";
    var days = user.trial_days_remaining || 0;

    // Check for expired trial (plan reverted to free, but user had a trial)
    var hadTrial = !!user.trial_end;
    var trialExpired = hadTrial && !isTrial && plan === "free";

    if (trialExpired) {
      // Trial has expired
      banner.style.display = "block";
      banner.innerHTML =
        '<div style="background:var(--bg-card); border:3px solid var(--orange); border-radius:10px; box-shadow:3px 3px 0 var(--ink); padding:14px 20px; margin-top:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">' +
          '<div>' +
            '<span style="font-family:var(--font-display); font-size:14px; color:var(--ink);">Your Pro trial has ended</span>' +
            '<span style="font-family:var(--font-hand); font-size:14px; color:var(--ink-medium); margin-left:8px;">upgrade to keep league-contextualized agents</span>' +
          '</div>' +
          '<a href="/pricing.html" class="btn-chunky btn-primary" style="font-size:12px; padding:6px 16px; text-decoration:none;">See Plans</a>' +
        '</div>';
    } else if (isTrial && days <= 2) {
      // Trial ending soon
      banner.style.display = "block";
      var urgencyColor = days <= 1 ? "var(--red, #e74c3c)" : "var(--orange)";
      var msg = days <= 1
        ? "Your Pro trial ends tomorrow"
        : "Your Pro trial ends in " + days + " days";
      banner.innerHTML =
        '<div style="background:var(--bg-card); border:3px solid ' + urgencyColor + '; border-radius:10px; box-shadow:3px 3px 0 var(--ink); padding:14px 20px; margin-top:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">' +
          '<div>' +
            '<span style="font-family:var(--font-display); font-size:14px; color:var(--ink);">' + msg + '</span>' +
            '<span style="font-family:var(--font-hand); font-size:14px; color:var(--ink-medium); margin-left:8px;">keep your league-contextualized agents</span>' +
          '</div>' +
          '<a href="/pricing.html" class="btn-chunky btn-primary" style="font-size:12px; padding:6px 16px; text-decoration:none;">Upgrade Now</a>' +
        '</div>';
    }
  } catch(e) {}
})();
