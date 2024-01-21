const accessToken = config.accessToken || "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";

// Theme change dark and light
const body = document.body;
const themeButton = document.getElementById('themeButton');

themeButton.addEventListener('click', toggleTheme);

function toggleTheme() {
    body.classList.toggle('dark-theme');
}

// required variables
let reposData = [];
let currentPage = 1;
const reposPerPage = 10;
const maxPagesInPagination = 9;

// DOM variables
let backBtn = document.getElementById("backBtn");
let userInformation = document.getElementById("userInformation");

// on Submit of github form
document.getElementById('githubForm').addEventListener('submit', function (e) {
    e.preventDefault();

    document.getElementById('loader').style.display = 'block';
    const username = document.getElementById('username').value;
    const userUrl = `https://api.github.com/users/${username}?access_token=${accessToken}`;
    const reposUrl = `https://api.github.com/users/${username}/repos?access_token=${accessToken}`;

    Promise.all([
        fetch(userUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()),
        fetch(reposUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json())
    ])
        .then(([userDataResponse, reposDataResponse]) => {
            reposData = reposDataResponse;
            currentPage = 1;
            displayUserData(userDataResponse);
            document.getElementById('githubForm').style.display = "none"
            backBtn.style.display = "block"
            document.getElementById('loader').style.display = 'none';

        })
        .then(() => {
            displayRepos();
            backBtn.style.display = "block"
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            displayUserDataError();
        });

});

// back function
function back() {
    location.reload();
}

// Display User data
function displayUserData(userData) {

    const userDataDiv = document.getElementById('userData');

    userDataDiv.innerHTML = `
    <div class="profile-container">
    <img class="userProfile"
        src="${userData.avatar_url}"
        alt="Profile Photo" style="width: 220px; height: 220px; border-radius:50%;">
    <div class="user-content">
        <h2>${userData.name ? userData.name : (alert("Please enter Valid username"), location.reload())}</h2>

        <p class="username">${userData.login}</p>
        <p>${userData.bio}</p>
        <p><i class="bi bi-geo-alt-fill"></i> ${userData.location ? userData.location : 'Not available'}</p>

        <div class="shortInfo">
            <p>Followers: ${userData.followers}</p>
            <p>Public Repositories: ${userData.public_repos}</p>

        </div>
        <p class="link"><i class="bi bi-link"></i> <a href="${userData.html_url}" target="_blank">${userData.html_url}</a>
        </p>

    </div>

    </div>
     
    `;
}

// Display Repos
function displayRepos() {
    const userDataDiv = document.getElementById('reposData');
    const reposList = document.createElement('div');
    reposList.classList.add('grid-container');
    const startIndex = (currentPage - 1) * reposPerPage;
    const endIndex = startIndex + reposPerPage;
    const currentRepos = reposData.slice(startIndex, endIndex);

    currentRepos.forEach(repo => {
        const repoItem = document.createElement('div');
        repoItem.classList.add('grid-item');
        repoItem.innerHTML = `
            <h2>${repo.name}</h2>
            <p>${repo.description || 'No description available'}</p>
            <div class="technologies" id="tech-${repo.name}">Loading...</div>
        `;
        reposList.appendChild(repoItem);

        // Fetch technologies used by the repository
        const techUrl = `https://api.github.com/repos/${repo.full_name}/languages`;
        fetch(techUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(techData => {
                const techDiv = document.getElementById(`tech-${repo.name}`);
                techDiv.innerHTML = Object.keys(techData).map(tech => `<div>${tech}</div>`).join('');
                techDiv.classList.add('technologies'); // Add the 'technologies' class to the container
            })
            .catch(error => {
                console.error(`Error fetching technologies for ${repo.name}:`, error);
                const techDiv = document.getElementById(`tech-${repo.name}`);
                techDiv.innerHTML = '<div style="background-color: #3498db; padding: 7px 10px; color: white; border-radius: 5px; font-size: 12px; margin: 10px;">Not available</div>';
                techDiv.classList.add('technologies'); // Add the 'technologies' class to the container
            });
    });

    userDataDiv.innerHTML = '';
    userDataDiv.appendChild(reposList);


    displayPagination();
}

// Display Pagination
function displayPagination() {
    const paginationDiv = document.getElementById('pagination');
    const totalPages = Math.ceil(reposData.length / reposPerPage);

    let paginationButtons = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationButtons += `<button  class="index" onclick="loadPage(${i})" ${currentPage === i ? 'disabled' : ''}>${i}</button>`;
    }

    if (totalPages > 1) {
        paginationDiv.innerHTML = `
            <button class="index"  onclick="loadPrevPage()" ${currentPage === 1 ? 'disabled' : ''}><i class="bi bi-caret-left-fill"></i></button>
            ${paginationButtons}
            <button class="index" onclick="loadNextPage()" ${currentPage === totalPages ? 'disabled' : ''}><i class="bi bi-caret-right-fill"></i></button>
        `;
    } else {
        paginationDiv.innerHTML = '';
    }
}

function loadPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayRepos();
    }
}

function loadNextPage() {
    const totalPages = Math.ceil(reposData.length / reposPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayRepos();
    }
}

function loadPage(pageNumber) {
    currentPage = pageNumber;
    displayRepos();
}

// Display error if user not found
function displayUserDataError() {
    const userDataDiv = document.getElementById('userData');
    userDataDiv.innerHTML = '<p>Error fetching user data. Please try again.</p>';
}