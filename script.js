//d7A7C4zf3WCuAG3ADAnJiGwmA7wAkWzh

document.getElementById('location-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const location = document.getElementById('location').value;
    getGeocode(location);
});

async function getGeocode(location) {
    const apiKey = 'd7A7C4zf3WCuAG3ADAnJiGwmA7wAkWzh';
    const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(location)}.json?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const lat = result.position.lat;
            const lon = result.position.lon;
            getParkingLots(lat, lon);
        } else {
            document.getElementById('result').innerText = 'No results found for the specified location.';
        }
    } catch (error) {
        console.error('Error fetching geocode:', error);
        document.getElementById('result').innerText = 'Error fetching geocode. Please try again.';
    }
}

async function getParkingLots(lat, lon) {
    const url = `https://api.ibb.gov.tr/ispark/Park`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            const sortedParkingLots = data
                .map(park => {
                    const distance = calculateDistance(lat, lon, parseFloat(park.lat), parseFloat(park.lng));
                    return { ...park, distance: distance };
                })
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 5);

            displayParkingLots(sortedParkingLots);
        } else {
            document.getElementById('result').innerText = 'No parking lots found.';
        }
    } catch (error) {
        console.error('Error fetching parking lots:', error);
        document.getElementById('result').innerText = 'Error fetching parking lots. Please try again.';
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function displayParkingLots(parkingLots) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<h2>Closest Parking Lots</h2>';

    parkingLots.forEach(park => {
        const parkElement = document.createElement('div');
        parkElement.classList.add('park');

        // Create a span for available capacity to apply conditional styling
        const availableCapacity = document.createElement('span');
        availableCapacity.innerText = park.emptyCapacity;
        if (park.emptyCapacity > 10) {
            availableCapacity.style.color = 'green';
            availableCapacity.style.fontWeight = 'bold';
        } else {
            availableCapacity.style.color = 'red';
            availableCapacity.style.fontWeight = 'bold';
        }

        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${park.lat},${park.lng}`;

        parkElement.innerHTML = `
            <h3>${park.parkName}</h3>
            <p><strong>Mesafe:</strong> ${park.distance.toFixed(2)} km</p>
            <p><strong>Toplam Kapasite:</strong> ${park.capacity}</p>
            <p><strong>Uygun Kapasite:</strong> ${availableCapacity.outerHTML}</p>
            <p><strong>Tip:</strong> ${park.parkType}</p>
            <p><strong>Bölge:</strong> ${park.district}</p>
            <p><strong>Çalışma Saatleri:</strong> ${park.workHours}</p>
            <p><a href="${googleMapsUrl}" target="_blank">View on Google Maps</a></p>
        `;
        resultDiv.appendChild(parkElement);
    });
}
