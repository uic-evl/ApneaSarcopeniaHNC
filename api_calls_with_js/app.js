async function main() {
  const client_id = "23PMSW";
  const client_secret = "8795f633d4c6766220b4edd0d2d2bb04";
  const authorizationUrl = "https://www.fitbit.com/oauth2/authorize";
  const tokenUrl = "https://api.fitbit.com/oauth2/token";
  const scope =
    "activity heartrate nutrition oxygen_saturation respiratory_rate settings sleep temperature weight";
  const redirect_uri = "http://localhost:5500/api_calls_with_js/index.html";
  const code_verifier = generateRandomString();

  var challenge = await challenge_from_verifier(code_verifier);

  const fullUrl = `${authorizationUrl}?client_id=${client_id}&response_type=code&scope=${scope}&redirect_uri=${redirect_uri}&code_challenge_method=S256&code_challenge=${challenge}`;

  // update the link in the HTML
  document.getElementById("auth_link").href = fullUrl;

  console.log(code_verifier, challenge);

  const code = new URLSearchParams(window.location.search).get("code"); // Get the authorization code from the URL
  console.log(code);

  // Prepare the body for the POST request
  const body = new URLSearchParams();
  body.append("client_id", client_id);
  body.append("code", code); // The authorization code we just received
  body.append("grant_type", "authorization_code");
  body.append("code_verifier", code_verifier);
  //   body.append("redirect_uri", redirect_uri);

  // Make the POST request to exchange the code for an access token
  fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(), // The body must be URL-encoded
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.access_token) {
        console.log("Access Token:", data.access_token); // Use this access token for subsequent API requests
        fetchFitbitData(data.access_token); // Function to fetch Fitbit data using the access token
      } else {
        console.error("Error fetching access token:", data);
      }
    })
    .catch((error) => console.error("Error during token exchange:", error));
}

function fetchFitbitData(accessToken) {
  fetch("https://api.fitbit.com/1/user/-/profile.json", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken, // Bearer token for authentication
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Fitbit Profile Data:", data);
      // Do something with the data, e.g., display it on the page
    })
    .catch((error) => console.error("Error fetching Fitbit data:", error));
}

function dec2hex(dec) {
  return ("0" + dec.toString(16)).substr(-2);
}

function generateRandomString() {
  var array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join("");
}

function sha256(plain) {
  // returns promise ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a) {
  var str = "";
  var bytes = new Uint8Array(a);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function challenge_from_verifier(v) {
  hashed = await sha256(v);
  base64encoded = base64urlencode(hashed);
  return base64encoded;
}

main();
