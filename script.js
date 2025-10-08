const newsFeed = document.getElementById('news-feed');

const articles = [
    {
        title: 'Breaking News: The Rise of AI',
        content: 'Artificial intelligence is transforming the world as we know it, from healthcare to entertainment.'
    },
    {
        title: 'Tech Giants Unveil New Gadgets',
        content: 'This week, major tech companies revealed their latest innovations, including foldable phones and smart glasses.'
    },
    {
        title: 'Space Exploration Reaches New Heights',
        content: 'A new mission to Mars has been announced, with the goal of establishing a human colony on the red planet.'
    },
    {
        title: 'The Future of Renewable Energy',
        content: 'Scientists have made a breakthrough in solar panel efficiency, paving the way for a greener future.'
    }
];

function renderArticles() {
    for (const article of articles) {
        const articleElement = document.createElement('div');
        articleElement.className = 'article';

        const titleElement = document.createElement('h2');
        titleElement.textContent = article.title;

        const contentElement = document.createElement('p');
        contentElement.textContent = article.content;

        articleElement.appendChild(titleElement);
        articleElement.appendChild(contentElement);

        newsFeed.appendChild(articleElement);
    }
}

renderArticles();