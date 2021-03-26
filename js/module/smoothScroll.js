
const smootnScroll = () => {
    const scrollLinks = document.querySelectorAll('a.scroll-link');

	for (const scrollLink of scrollLinks) scrollLink.addEventListener('click', event => {
		event.preventDefault();
		const id = scrollLink.getAttribute('href').toLowerCase();
		document.querySelector(id).scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		})
	})
};

export default smootnScroll;
