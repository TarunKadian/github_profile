// Declare global variables
let myParam: string; // User parameter
let currentPage: number = 1; // Current page number
let reposPerPage: number = 10; // Default repositories per page

// Function to display repositories
function displayRepos(repos: any[]): void {
	// Get repository list container
	const repoListContainer: HTMLElement | null = document.getElementById('repoList');
	if (!repoListContainer) return;
	repoListContainer.innerHTML = ''; // Clear existing repo list

	// Check if repositories are available
	if (!repos || repos.length === 0) {
		console.warn('No repositories found for the user.');
		return;
	}

	// Calculate start and end indices for pagination
	const startIndex: number = (currentPage - 1) * reposPerPage;
	const endIndex: number = startIndex + reposPerPage;
	const paginatedRepos: any[] = repos.slice(startIndex, endIndex);

	// Iterate through paginated repositories
	for (const repo of paginatedRepos) {
		// Create repository card element
		const repoCard: HTMLDivElement = document.createElement('div');
		repoCard.className =
			'bg-gray-800 p-4 rounded shadow transition transform hover:scale-105';
		repoCard.innerHTML = `
            <h2 class="text-xl font-bold mb-2">${repo.name}</h2>
            <p class="text-gray-400 mb-2">${repo.description || 'No description'}</p>
            <div class="flex">
                <span class="bg-gray-300 text-gray-800 font-semibold px-2 py-1 rounded mr-2">
                    ${repo.language || 'Unknown'}
                </span>
            </div>
        `;
		repoListContainer.appendChild(repoCard);
	}

	// Update pagination
	updatePagination(repos.length);
}

// Function to update pagination buttons
function updatePagination(totalRepos: number): void {
	const totalPages: number = Math.ceil(totalRepos / reposPerPage);
	const paginationContainer: HTMLElement | null = document.getElementById('paginationContainer');
	if (!paginationContainer) return;
	paginationContainer.innerHTML = '';

	// Create buttons for each page
	for (let i = 1; i <= totalPages; i++) {
		const pageButton: HTMLButtonElement = document.createElement('button');
		pageButton.className = `px-3 py-2 ${
			currentPage === i ? 'bg-gray-700' : 'bg-gray-500'
		} text-white rounded-full mx-1 focus:outline-none`;
		pageButton.innerText = i.toString();

		// Add event listener to each page button
		pageButton.addEventListener('click', () => {
			currentPage = i;
			const githubReposData: any[] = JSON.parse(localStorage.getItem(`${myParam}Repos`));
			displayRepos(githubReposData);
		});

		paginationContainer.appendChild(pageButton);
	}
}

// Function to change repositories per page
function changeReposPerPage(value: string): void {
	reposPerPage = parseInt(value, 10);
	const githubReposData: any[] = JSON.parse(localStorage.getItem(`${myParam}Repos`));
	displayRepos(githubReposData);
}

// Function to filter repositories by name
function filterReposByName(name: string, repos: any[]): void {
	const filteredRepos: any[] = repos.filter(repo =>
		repo.name.toLowerCase().includes(name.toLowerCase())
	);
	displayRepos(filteredRepos);
}

// Function to fetch user data from GitHub API
function fetchUserData(username: string): Promise<any> {
	const apiUrl: string = `https://api.github.com/users/${username}`;
	return fetch(apiUrl)
		.then(response => response.json())
		.catch(error => {
			console.error('Error fetching user data:', error);
			return null;
		});
}

// Event listener when DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
	// Get username parameter from URL
	const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
	myParam = urlParams.get('user') || ''; // Assign value to myParam

	// Check if username is available
	if (!myParam) {
		console.error('Username not found in the URL.');
		return;
	}

	// Show loading indicators
	const followersElement: HTMLElement | null = document.getElementById('followers');
	const followingElement: HTMLElement | null = document.getElementById('following');
	const publicReposElement: HTMLElement | null = document.getElementById('publicRepos');
	if (followersElement) followersElement.innerText = 'Loading...';
	if (followingElement) followingElement.innerText = 'Loading...';
	if (publicReposElement) publicReposElement.innerText = 'Loading...';

	// Fetch user data and repositories
	Promise.all([fetchUserData(myParam), fetchUserData(`${myParam}/repos`)])
		.then(([userData, reposData]) => {
			// Populate user information
			const userProfilePicture: HTMLImageElement | null = document.getElementById('userProfilePicture');
			const usernameElement: HTMLElement | null = document.getElementById('username');
			const userBio: HTMLElement | null = document.getElementById('userBio');
			const githubProfileLink: HTMLAnchorElement | null = document.getElementById('githubProfileLink');
			if (userProfilePicture) userProfilePicture.src = userData?.avatar_url || 'placeholder_image_url';
			if (usernameElement) usernameElement.innerText = userData?.login || 'Username';
			if (userBio) userBio.innerText = userData?.bio || 'No bio available';
			if (githubProfileLink) githubProfileLink.href = userData?.html_url || '#';

			// Fetch and display additional user information
			if (followersElement) followersElement.innerText = userData?.followers || 'Loading...';
			if (followingElement) followingElement.innerText = userData?.following || 'Loading...';
			if (publicReposElement) publicReposElement.innerText = userData?.public_repos || 'Loading...';

			// Save repositories data to local storage
			localStorage.setItem(`${myParam}Repos`, JSON.stringify(reposData));

			// Display repos based on the default repos per page value
			displayRepos(reposData);
		})
		.catch(error => {
			console.error('Error fetching user data:', error);
		});
});

// Function to handle input changes in the repository name field
function handleRepoNameInput(value: string): void {
	const githubReposData: any[] = JSON.parse(localStorage.getItem(`${myParam}Repos`) || '[]');
	filterReposByName(value, githubReposData);
}