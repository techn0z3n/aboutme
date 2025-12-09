fetch('/news.json')
    .then(res => res.json())
    .then(news => {
        if (!Array.isArray(news) || news.length === 0) return;

        news = news.sort((a, b) => {
            const timeA = a.time > 1e10 ? Math.floor(a.time / 1000) : a.time;
            const timeB = b.time > 1e10 ? Math.floor(b.time / 1000) : b.time;
            return timeB - timeA;
        });

        function renderNewsItem(entry, options = {}) {
            const unixTime = entry.time > 1e10 ? Math.floor(entry.time / 1000) : entry.time;
            const time = new Date(unixTime * 1000).toLocaleString();

            const container = document.createElement('div');
            container.className = options.full ?
                'bg-gray-800 p-6 rounded-lg flex items-start' :
                'bg-gray-700 p-4 rounded-lg mb-4 flex items-start';

            let avatarImg;
            if (options.preview) {
                avatarImg = document.createElement('div');
                avatarImg.className = 'h-10 w-10 rounded-full bg-gray-600 mr-4 flex items-center justify-center text-sm font-bold';
                avatarImg.textContent = entry.author?. [0]?.toUpperCase() || '?';
            } else {
                avatarImg = new Image();
                avatarImg.src = `/pfp/${entry.author}.png`;
                avatarImg.alt = `${entry.author}'s avatar`;
                avatarImg.className = 'h-10 w-10 rounded-full mr-4';
                avatarImg.onerror = () => {
                    avatarImg.onerror = null;
                    avatarImg.src = '/icons/user.svg';
                    avatarImg.style.filter = 'invert(1)';
                };
            }

            let entryContent = entry.content || '';
            if (!options.full && entryContent.length > 750) {
                entryContent = entryContent.substring(0, 750) + '...';
            }

            const content = document.createElement('div');
            content.className = 'flex-1';
            content.innerHTML = `
        <h1 class="${options.full ? 'text-4xl' : 'text-xl'} font-bold mb-2">
            ${options.full
                ? entry.title
                : `<a href="/news/${entry.id}" class="hover:underline text-indigo-300">${entry.title}</a>`}
        </h1>
        <p class="text-sm text-gray-400 mb-4">By ${entry.author} • ${time}</p>
        <div class="text-lg">${entryContent.replaceAll("\n", "<br>")}</div>
    `;

            container.appendChild(avatarImg);
            container.appendChild(content);
            return container;
        }

        // Check for /news/:id route
        const match = window.location.pathname.match(/^\/news\/([a-zA-Z0-9_-]+)$/);
        if (match) {
            const articleId = match[1];
            const article = news.find(n => n.id === articleId);
            const main = document.getElementById('full-article');

            if (!article || !main) {
                main.innerHTML = `<p class="text-red-400">Article not found.</p>`;
                return;
            }

            document.title = `${article.title} - StateFarm Client News`;

            //make new a element
            const a = document.createElement('a');
            a.innerHTML = `
                <a href="/news" class="text-indigo-400 hover:underline block mb-6">&larr; Back to News</a>
            `;
            main.appendChild(a);

            const articleEl = renderNewsItem(article, {
                full: true
            });
            main.appendChild(articleEl);
            return; // don't render rest
        }

        // If not on /news/:id, render normal latest/all
        const latestContainer = document.getElementById('news-latest');
        if (latestContainer) {
            const latestItem = renderNewsItem(news[0]);
            latestItem.classList.remove('mb-4');
            latestContainer.appendChild(latestItem);
        }

        const listContainer = document.getElementById('news-list');
        if (listContainer) {
            news.forEach(entry => {
                const item = renderNewsItem(entry);
                listContainer.appendChild(item);
            });
        }
    })
    .catch(err => console.error('Failed to load news:', err));