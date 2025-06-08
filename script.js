Document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const navbar = document.getElementById('navbar');
    const scrollTopBtn = document.querySelector('.scroll-top');
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const htmlElement = document.documentElement;
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-links');


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
        setTheme('dark'); // Default to dark theme if no preference is set
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
    }, 1800); // Delay for initial text animation and bars

    // --- Scroll to Top button functionality ---
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
    const currentPage = window.location.pathname.split('/').pop();
    navLinks.forEach(link => {
        link.classList.remove('active'); // Remove active from all first
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });

    // --- Mobile Navigation Toggle ---
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.querySelector('i').classList.toggle('fa-bars');
        mobileToggle.querySelector('i').classList.toggle('fa-times');
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.querySelector('i').classList.remove('fa-times');
                mobileToggle.querySelector('i').classList.add('fa-bars');
            }
        });
    });


    // --- Helper function for text highlighting ---
    const highlightText = (text, searchTerm) => {
        if (!searchTerm) return text;
        const terms = searchTerm.split(/\s+/).filter(word => word.length > 0);
        if (terms.length === 0) return text;
        const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
        return text.replace(regex, '<span class="highlight">$&</span>');
    };


    // --- Rules Page Specific Logic (only if on rules.html) ---
    if (document.getElementById('rulesGrid')) {
        const rulesGrid = document.getElementById('rulesGrid');
        const ruleCards = rulesGrid.querySelectorAll('.rule-card');
        const ruleCategoryTitles = rulesGrid.querySelectorAll('.rule-category-title');
        const filterButtons = document.querySelectorAll('.filter-buttons .filter-btn'); // Corrected selector
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


        const filterRules = () => {
            const searchTerm = ruleSearchInput.value.toLowerCase().trim();
            const activeFilterButton = document.querySelector('.filter-buttons .filter-btn.active');
            const activeFilter = activeFilterButton ? activeFilterButton.dataset.filter : 'all';
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
                    descriptionText.includes(searchTerm) ||
                    card.dataset.tags.toLowerCase().includes(searchTerm); // Also search in tags for better results

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

                    let parentCategory = null;
                    if (activeFilter !== 'all') {
                        parentCategory = activeFilter;
                    } else if (isSearching) {
                        let currentElement = card.previousElementSibling;
                        while(currentElement && !currentElement.classList.contains('rule-category-title')) {
                            currentElement = currentElement.previousElementSibling;
                        }
                        if (currentElement) {
                            parentCategory = currentElement.dataset.category;
                        }
                    } else {
                        let currentElement = card.previousElementSibling;
                        while(currentElement && !currentElement.classList.contains('rule-category-title')) {
                            currentElement = currentElement.previousElementSibling;
                        }
                        if (currentElement) {
                            parentCategory = currentElement.dataset.category;
                        }
                    }
                    if (parentCategory) {
                        categoriesPresent.add(parentCategory);
                    }
                } else {
                    card.style.display = 'none';
                    card.classList.remove('visible');
                }
            });

            ruleCategoryTitles.forEach(title => {
                const category = title.dataset.category;
                if (categoriesPresent.has(category)) {
                    title.style.display = 'block';
                    title.classList.add('visible');
                } else {
                    title.style.display = 'none';
                    title.classList.remove('visible');
                }
            });

            if (!isSearching && activeFilter === 'all' && categoriesPresent.size === 0 && ruleCards.length > 0) {
                ruleCategoryTitles.forEach(title => {
                    title.style.display = 'block';
                    title.classList.add('visible');
                });
            }
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


    // --- Channel Guide Page Specific Logic (only if on channels.html) ---
    if (document.getElementById('channelsGrid')) {
        const channelsGrid = document.getElementById('channelsGrid');
        const channelCards = channelsGrid.querySelectorAll('.rule-card');
        const channelCategoryTitles = channelsGrid.querySelectorAll('.rule-category-title');
        const filterButtons = document.querySelectorAll('.filter-buttons .filter-btn');
        const channelSearchInput = document.getElementById('channelSearch');

        const originalChannelContent = {};
        channelCards.forEach(card => {
            const channelTitle = card.querySelector('.rule-title');
            const channelDescription = card.querySelector('.rule-description');
            originalChannelContent[channelTitle.textContent.trim()] = {
                title: channelTitle.innerHTML,
                description: channelDescription.innerHTML
            };
        });

        const filterChannels = () => {
            const searchTerm = channelSearchInput.value.toLowerCase().trim();
            const activeFilterButton = document.querySelector('.filter-buttons .filter-btn.active');
            const activeFilter = activeFilterButton ? activeFilterButton.dataset.filter : 'all';
            const isSearching = searchTerm !== '';
            const categoriesPresent = new Set();
            let animationDelay = 0;

            channelCards.forEach(card => {
                card.style.display = 'none';
                card.classList.remove('visible');
                card.style.animationDelay = '0ms';
            });
            channelCategoryTitles.forEach(title => {
                title.style.display = 'none';
                title.classList.remove('visible');
                title.style.animationDelay = '0ms';
            });

            channelCards.forEach(card => {
                const originalTitle = originalChannelContent[card.querySelector('.rule-title').textContent.trim()].title;
                const originalDescription = originalChannelContent[card.querySelector('.rule-title').textContent.trim()].description;
                const titleText = originalTitle.toLowerCase();
                const descriptionText = originalDescription.toLowerCase();

                const matchesSearch = !isSearching ||
                    titleText.includes(searchTerm) ||
                    descriptionText.includes(searchTerm) ||
                    card.dataset.tags.toLowerCase().includes(searchTerm);

                const tags = card.dataset.tags.toLowerCase();
                const matchesFilter = activeFilter === 'all' || tags.includes(activeFilter);

                card.querySelector('.rule-title').innerHTML = originalTitle;
                card.querySelector('.rule-description').innerHTML = originalDescription;

                if (matchesSearch && matchesFilter) {
                    card.style.display = 'flex';
                    if (isSearching) {
                        card.querySelector('.rule-title').innerHTML = highlightText(originalTitle, searchTerm);
                        card.querySelector('.rule-description').innerHTML = highlightText(originalDescription, searchTerm);
                    }
                    card.style.animationDelay = `${animationDelay}ms`;
                    card.classList.add('visible');
                    animationDelay += 70;

                    let parentCategory = null;
                    if (activeFilter !== 'all') {
                        parentCategory = activeFilter;
                    } else if (isSearching) {
                        let currentElement = card.previousElementSibling;
                        while(currentElement && !currentElement.classList.contains('rule-category-title')) {
                            currentElement = currentElement.previousElementSibling;
                        }
                        if (currentElement) {
                            parentCategory = currentElement.dataset.category;
                        }
                    } else {
                        let currentElement = card.previousElementSibling;
                        while(currentElement && !currentElement.classList.contains('rule-category-title')) {
                            currentElement = currentElement.previousElementSibling;
                        }
                        if (currentElement) {
                            parentCategory = currentElement.dataset.category;
                        }
                    }

                    if (parentCategory) {
                        categoriesPresent.add(parentCategory);
                    }
                } else {
                    card.style.display = 'none';
                    card.classList.remove('visible');
                }
            });

            channelCategoryTitles.forEach(title => {
                const category = title.dataset.category;
                if (categoriesPresent.has(category)) {
                    title.style.display = 'block';
                    title.classList.add('visible');
                } else {
                    title.style.display = 'none';
                    title.classList.remove('visible');
                }
            });

            if (!isSearching && activeFilter === 'all' && categoriesPresent.size === 0 && channelCards.length > 0) {
                channelCategoryTitles.forEach(title => {
                    title.style.display = 'block';
                    title.classList.add('visible');
                });
            }
        };

        channelSearchInput.addEventListener('input', filterChannels);
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterChannels();
            });
        });

        // Initial filter call when the channels page loads
        filterChannels();
    }

    // --- Roles Info Page Specific Logic (only if on roles.html) ---
    // (This block would be added here if you had roles.html content and logic)
    if (document.getElementById('rolesGrid')) {
        const rolesGrid = document.getElementById('rolesGrid');
        const roleCards = rolesGrid.querySelectorAll('.rule-card');
        const roleCategoryTitles = rolesGrid.querySelectorAll('.rule-category-title');
        const filterButtons = document.querySelectorAll('.filter-buttons .filter-btn');
        const roleSearchInput = document.getElementById('roleSearch');

        const originalRoleContent = {};
        roleCards.forEach(card => {
            const roleTitle = card.querySelector('.rule-title');
            const roleDescription = card.querySelector('.rule-description');
            originalRoleContent[roleTitle.textContent.trim()] = {
                title: roleTitle.innerHTML,
                description: roleDescription.innerHTML
            };
        });

        const filterRoles = () => {
            const searchTerm = roleSearchInput.value.toLowerCase().trim();
            const activeFilterButton = document.querySelector('.filter-buttons .filter-btn.active');
            const activeFilter = activeFilterButton ? activeFilterButton.dataset.filter : 'all';
            const isSearching = searchTerm !== '';
            const categoriesPresent = new Set();
            let animationDelay = 0;

            roleCards.forEach(card => {
                card.style.display = 'none';
                card.classList.remove('visible');
                card.style.animationDelay = '0ms';
            });
            roleCategoryTitles.forEach(title => {
                title.style.display = 'none';
                title.classList.remove('visible');
                title.style.animationDelay = '0ms';
            });

            roleCards.forEach(card => {
                const originalTitle = originalRoleContent[card.querySelector('.rule-title').textContent.trim()].title;
                const originalDescription = originalRoleContent[card.querySelector('.rule-title').textContent.trim()].description;
                const titleText = originalTitle.toLowerCase();
                const descriptionText = originalDescription.toLowerCase();

                const matchesSearch = !isSearching ||
                    titleText.includes(searchTerm) ||
                    descriptionText.includes(searchTerm) ||
                    card.dataset.tags.toLowerCase().includes(searchTerm);

                const tags = card.dataset.tags.toLowerCase();
                const matchesFilter = activeFilter === 'all' || tags.includes(activeFilter);

                card.querySelector('.rule-title').innerHTML = originalTitle;
                card.querySelector('.rule-description').innerHTML = originalDescription;

                if (matchesSearch && matchesFilter) {
                    card.style.display = 'flex';
                    if (isSearching) {
                        card.querySelector('.rule-title').innerHTML = highlightText(originalTitle, searchTerm);
                        card.querySelector('.rule-description').innerHTML = highlightText(originalDescription, searchTerm);
                    }
                    card.style.animationDelay = `${animationDelay}ms`;
                    card.classList.add('visible');
                    animationDelay += 70;
                    const primaryTag = tags.split(' ')[0];
                    if (primaryTag) {
                        categoriesPresent.add(primaryTag);
                    }
                } else {
                    card.style.display = 'none';
                    card.classList.remove('visible');
                }
            });

            roleCategoryTitles.forEach(title => {
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

            if (!isSearching && activeFilter === 'all' && categoriesPresent.size === 0 && roleCards.length > 0) {
                roleCategoryTitles.forEach(title => {
                    title.style.display = 'block';
                    title.classList.add('visible');
                });
            }
        };

        roleSearchInput.addEventListener('input', filterRoles);
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterRoles();
            });
        });

        // Initial filter call when the roles page loads
        filterRoles();
    }
});
