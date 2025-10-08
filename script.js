const newsFeed = document.getElementById('news-feed');
const categorySelect = document.getElementById('category-select');
const API_BASE_URL = 'https://saurav.tech/NewsAPI/top-headlines/category/';

async function fetchNews(category = 'general') {
    const API_URL = `${API_BASE_URL}${category}/us.json`;
    newsFeed.innerHTML = '<p>Loading news...</p>';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderArticles(data.articles);
    } catch (error) {
        console.error('Error fetching news:', error);
        newsFeed.innerHTML = '<p>Sorry, we could not fetch the news at this time. Please try again later.</p>';
    }
}

function renderArticles(articles) {
    newsFeed.innerHTML = '';

    if (!articles || articles.length === 0) {
        newsFeed.innerHTML = '<p>No news articles found for this category.</p>';
        return;
    }

    for (const article of articles) {
        const articleElement = document.createElement('div');
        articleElement.className = 'article';

        if (article.urlToImage) {
            const imageElement = document.createElement('img');
            imageElement.src = article.urlToImage;
            imageElement.alt = article.title || 'News article image';
            imageElement.onerror = (e) => {
                e.target.style.display = 'none';
            };
            articleElement.appendChild(imageElement);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';

        const titleElement = document.createElement('h2');
        const linkElement = document.createElement('a');
        linkElement.href = article.url;
        linkElement.textContent = article.title;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        titleElement.appendChild(linkElement);

        const contentElement = document.createElement('p');
        contentElement.textContent = article.description || '';

        contentDiv.appendChild(titleElement);
        contentDiv.appendChild(contentElement);
        articleElement.appendChild(contentDiv);

        newsFeed.appendChild(articleElement);
    }
}

// Add event listener to the category selector
categorySelect.addEventListener('change', (event) => {
    const selectedCategory = event.target.value;
    fetchNews(selectedCategory);
});

// Initial fetch for the default category
fetchNews();