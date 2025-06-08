document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const navbar = document.getElementById('navbar');
    const scrollTopBtn = document.querySelector('.scroll-top');
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const htmlElement = document.documentElement;

    // --- Theme Toggle (Dark/Light) ---
    const setTheme = (theme) => {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'light') {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    };

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        setTheme(currentTheme);
    } else {
        setTheme('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        let theme = htmlElement.getAttribute('data-theme');
        if (theme === 'light') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    });

    // --- Loading Screen Logic ---
    setTimeout(() => {
        loadingScreen.classList.add('loaded'); // Hides loading screen
        // Navbar is already visible by default now, so no need for a separate class add
    }, 1800); // Delay for initial text animation and bars

    // --- Scroll to Top button functionality ---
    // This now refers to the current page's scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Active Navbar Link on page load ---
    // This determines which link is 'active' based on the current page's URL
    const currentPage = window.location.pathname.split('/').pop();
    navLinks.forEach(link => {
        link.classList.remove('active'); // Remove active from all first
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });

    // --- Rules Page Specific Logic (only if on rules.html) ---
    if (document.getElementById('rulesGrid')) {
        const rulesGrid = document.getElementById('rulesGrid');
        const ruleCards = rulesGrid.querySelectorAll('.rule-card');
        const ruleCategoryTitles = rulesGrid.querySelectorAll('.rule-category-title');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const ruleSearchInput = document.getElementById('ruleSearch');

        // Store original content of rule cards to reset during search
        const originalRuleContent = {};
        ruleCards.forEach(card => {
            const ruleNumberElement = card.querySelector('.rule-number');
            const ruleNumber = ruleNumberElement ? ruleNumberElement.textContent.trim() : card.dataset.ruleId;
            const ruleTitle = card.querySelector('.rule-title');
            const ruleDescription = card.querySelector('.rule-description');
            originalRuleContent[ruleNumber] = {
                title: ruleTitle.innerHTML,
                description: ruleDescription.innerHTML
            };
        });

        const highlightText = (text, searchTerm) => {
            if (!searchTerm) return text;
            const terms = searchTerm.split(/\s+/).filter(word => word.length > 0);
            if (terms.length === 0) return text;
            const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
            return text.replace(regex, '<span class="highlight">$&</span>');
        };

        const filterRules = () => {
            const searchTerm = ruleSearchInput.value.toLowerCase().trim();
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            const isSearching = searchTerm !== '';
            const categoriesPresent = new Set();
            let animationDelay = 0;

            // Hide all rule cards and categories first to reset animation
            ruleCards.forEach(card => {
                card.style.display = 'none';
                card.classList.remove('visible');
                card.style.animationDelay = '0ms';
            });
            ruleCategoryTitles.forEach(title => {
                title.style.display = 'none';
                title.classList.remove('visible');
                title.style.animationDelay = '0ms';
            });

            ruleCards.forEach(card => {
                const ruleNumberElement = card.querySelector('.rule-number');
                const ruleNumber = ruleNumberElement ? ruleNumberElement.textContent.trim() : card.dataset.ruleId;
                const originalTitle = originalRuleContent[ruleNumber].title;
                const originalDescription = originalRuleContent[ruleNumber].description;
                const titleText = originalTitle.toLowerCase();
                const descriptionText = originalDescription.toLowerCase();

                const matchesSearch = !isSearching ||
                    titleText.includes(searchTerm) ||
                    descriptionText.includes(searchTerm);

                const tags = card.dataset.tags.toLowerCase();
                const matchesFilter = activeFilter === 'all' || tags.includes(activeFilter);

                // Reset content before applying highlights
                card.querySelector('.rule-title').innerHTML = originalTitle;
                card.querySelector('.rule-description').innerHTML = originalDescription;

                if (matchesSearch && matchesFilter) {
                    card.style.display = 'flex';
                    if (isSearching) {
                        card.querySelector('.rule-title').innerHTML = highlightText(originalTitle, searchTerm);
                        card.querySelector('.rule-description').innerHTML = highlightText(originalDescription, searchTerm);
                    }
                    card.style.animationDelay = `${animationDelay}ms`;
                    card.classList.add('visible'); // Trigger slideInUp animation
                    animationDelay += 70; // Staggered animation
                    const primaryTag = tags.split(' ')[0];
                    if (primaryTag) {
                        categoriesPresent.add(primaryTag);
                    }
                } else {
                    card.style.display = 'none';
                    card.classList.remove('visible');
                }
            });

            ruleCategoryTitles.forEach(title => {
                const category = title.dataset.category;
                if (activeFilter === 'all' && !isSearching) {
                    title.style.display = 'block';
                    title.classList.add('visible');
                } else if (activeFilter !== 'all' && category === activeFilter) {
                    title.style.display = 'block';
                    title.classList.add('visible');
                } else if (isSearching && categoriesPresent.has(category)) {
                    title.style.display = 'block';
                    title.classList.add('visible');
                } else {
                    title.style.display = 'none';
                    title.classList.remove('visible');
                }
            });
        };

        ruleSearchInput.addEventListener('input', filterRules);
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterRules();
            });
        });

        // Initial filter call when the rules page loads
        filterRules();
    }
});
 lh
