if (!document.cookie) {
    alert("We use cookies");
    document.cookie = JSON.stringify({})
}

let points = [];
let position = {};

document.querySelector('.hint-div').addEventListener('click', function () {
    this.style.width = "50px";
});

async function fetchCoordinates() {
    try {
        const response = await fetch('/cords');
        if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.status}`);
        }
        points = await response.json();
        console.log(`Points loaded: ${points.length}`);
        go_random();
    } catch (error) {
        console.error('Failed to fetch points:', error);
    }
}
fetchCoordinates();

function go_random() {
    console.warn("Loading new point")
    if (!points || points.length === 0) {
        console.error('Список точек пуст!');
        return;
    }
    const iframe = document.getElementById('pano-iframe');
    if (!iframe) {
        console.error('pano-iframe not found');
        return;
    }
    const map_iframe = document.getElementById("map-iframe");
    if (!map_iframe) {
        console.error('map_iframe not found');
        return;
    }
    map_iframe.style = ""
    const guess_box = document.getElementsByClassName("guess-box").item(0);
    guess_box.style = "";
    const answer_box = document.getElementsByClassName("answer-box").item(0);
    answer_box.style = "display: none;";
    // const answer_div = document.getElementById("answer-div");
    // answer_div.style.display = "none";
    // const answer_iframe = document.getElementById("answer-iframe");
    // answer_iframe.src = `about:blank`;
    const randomIndex = Math.floor(Math.random() * points.length);
    const randomPoint = points[randomIndex];
    position.lat = randomPoint[0];
    position.lng = randomPoint[1];
    iframe.src = `/from_cords?longitude=${position.lng}&latitude=${position.lat}`;
    map_iframe.src = "/map";
    console.log(`Current position: ${position}`);
}

function to_start() {
    const iframe = document.getElementById('pano-iframe');
    if (!iframe) {
        console.error('pano-iframe not found');
        return;
    }
    iframe.src = `/from_cords?longitude=${position.lng}&latitude=${position.lat}`;
    console.log(`Return to start: [${latitude}, ${longitude}]`);
}

function cords_from_str(str) {
    const [lat, lng] = str.trim().split(/\s+/).map(Number);
    return { lat, lng };
}

function calculate_dist_meters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const DEG_TO_RAD = Math.PI / 180;
    const dLat = (lat2 - lat1) * DEG_TO_RAD;
    const dLng = (lng2 - lng1) * DEG_TO_RAD;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function guess() {
    const map_iframe = document.getElementById("map-iframe");
    var marker_str = map_iframe.contentWindow.document.title;
    if (marker_str && marker_str.includes(" ")) {
        var marker = cords_from_str(marker_str);
        console.log(`Marker cords: ${marker.lat} ${marker.lng}`);
    } else {
        const guess_btn = document.getElementById("guess");
        guess_btn.style.backgroundColor = "#ff6666";
        setTimeout(() => {
            guess_btn.style.backgroundColor = "";
        }, 250);
        console.log("Point is not set");
        return;
    }
    // const answer_iframe = document.getElementById("answer-iframe");
    // answer_iframe.src = `/answer_map?lat1=${marker.lat}&lng1=${marker.lng}&lat2=${position.lat}&lng2=${position.lng}`;
    // const answer_div = document.getElementById("answer-div");
    // answer_div.style = "";
    const guess_box = document.getElementsByClassName("guess-box").item(0);
    guess_box.style = "opacity: 1;";
    map_iframe.src = `/answer_map?lat1=${marker.lat}&lng1=${marker.lng}&lat2=${position.lat}&lng2=${position.lng}`;
    map_iframe.style = "\
    opacity: 1;\
    z-index: 200;\
    height: 100%;\
    width: 100%;\
    position: fixed;\
    top: 0;\
    left: 0;\
    border-radius: 0;\
    "
    var dist_meters = calculate_dist_meters(position.lat, position.lng, marker.lat, marker.lng);
    console.log(`distance: ${dist_meters}`);
    const distance_div = document.getElementById("distance-div");
    distance_div.textContent = `${dist_meters.toFixed(2)}m`;
    const show_pano_btn = document.getElementById("show-pano-btn");
    show_pano_btn.href = `/from_cords?longitude=${position.lng}&latitude=${position.lat}`;
    const answer_box = document.getElementsByClassName("answer-box").item(0);
    answer_box.style = "";
}
