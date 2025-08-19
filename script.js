document.addEventListener('DOMContentLoaded', function() {
    const voteButtons = document.querySelectorAll('.vote-btn');
    const navLinks = document.querySelectorAll('.nav-link');
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const scoreElement = this.nextElementSibling;
            let currentScore = parseInt(scoreElement.textContent);
            
            if (this.classList.contains('voted')) {
                this.classList.remove('voted');
                currentScore -= 1;
                scoreElement.textContent = currentScore;
            } else {
                this.classList.add('voted');
                currentScore += 1;
                scoreElement.textContent = currentScore;
            }
            
            const pointsElement = this.closest('.news-item').querySelector('.points');
            pointsElement.textContent = currentScore + ' points';
        });
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(nl => nl.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.textContent;
            loadSection(section);
        });
    });
    
    async function loadSection(section) {
        const newsList = document.getElementById('newsList');
        
        try {
            const posts = await loadPosts(section);
            
            newsList.innerHTML = '';
            
            posts.forEach((item, index) => {
                const newsItem = createNewsItem(item, index + 1);
                newsList.appendChild(newsItem);
            });
            
            attachVoteListeners();
        } catch (error) {
            console.error('Error loading posts:', error);
            newsList.innerHTML = '<div class="error">Failed to load posts</div>';
        }
    }
    
    async function loadPosts(section) {
        const response = await fetch(`posts/${section}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${section} posts`);
        }
        const posts = await response.json();
        
        return posts.map(post => ({
            title: post.title,
            domain: post.domain,
            url: post.url,
            points: post.points,
            author: post.author,
            time: formatRelativeTime(post.timestamp),
            comments: post.comments,
            type: post.type,
            id: post.id
        }));
    }
    
    function formatRelativeTime(timestamp) {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffInMs = now - postTime;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInMinutes < 60) {
            return diffInMinutes <= 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
            return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
        } else {
            return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
        }
    }
    
    function createNewsItem(item, id) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        
        const domainText = item.domain ? `(${item.domain})` : '';
        const isExternalLink = item.type === 'link';
        const titleLink = item.url ? 
            `<a href="${item.url}" class="title-link"${isExternalLink ? ' target="_blank"' : ''}>${item.title}</a>` : 
            `<span class="title-link">${item.title}</span>`;
        
        newsItem.innerHTML = `
            <div class="vote-section">
                <button class="vote-btn upvote" data-id="${id}">▲</button>
                <span class="score">${item.points}</span>
            </div>
            <div class="content">
                <h3 class="title">
                    ${titleLink}
                    ${domainText ? `<span class="domain">${domainText}</span>` : ''}
                </h3>
                <div class="meta">
                    <span class="points">${item.points} points</span>
                    <span class="author">by <a href="#" class="author-link">${item.author}</a></span>
                    <span class="time">${item.time}</span>
                    <span class="separator">|</span>
                    <a href="#" class="comments-link">${item.comments} comments</a>
                </div>
            </div>
        `;
        
        return newsItem;
    }
    
    function attachVoteListeners() {
        const voteButtons = document.querySelectorAll('.vote-btn');
        voteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const scoreElement = this.nextElementSibling;
                let currentScore = parseInt(scoreElement.textContent);
                
                if (this.classList.contains('voted')) {
                    this.classList.remove('voted');
                    currentScore -= 1;
                    scoreElement.textContent = currentScore;
                } else {
                    this.classList.add('voted');
                    currentScore += 1;
                    scoreElement.textContent = currentScore;
                }
                
                const pointsElement = this.closest('.news-item').querySelector('.points');
                pointsElement.textContent = currentScore + ' points';
            });
        });
    }
    
    function simulateTimeUpdate() {
        setInterval(() => {
            const timeElements = document.querySelectorAll('.time');
            timeElements.forEach(element => {
                let timeText = element.textContent;
                if (timeText.includes('minutes ago')) {
                    let minutes = parseInt(timeText);
                    if (!isNaN(minutes)) {
                        minutes += 1;
                        if (minutes >= 60) {
                            element.textContent = Math.floor(minutes / 60) + ' hours ago';
                        } else {
                            element.textContent = minutes + ' minutes ago';
                        }
                    }
                }
            });
        }, 60000);
    }
    
    simulateTimeUpdate();
    
    // Load default section on page load
    loadSection('new');
});