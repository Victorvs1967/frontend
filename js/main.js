const mySwiper = new Swiper('.swiper-container', {
	loop: true,
	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

const buttonCart = document.querySelector('.button-cart'),
	modalCart = document.querySelector('#modal-cart'),
	more = document.querySelector('.more'),
	navigationLink = document.querySelectorAll('.navigation-link'),
	longGoodsList = document.querySelector('.long-goods-list'),
	showAcsesories = document.querySelectorAll('.show-acsessories'),
	scrollLinks = document.querySelectorAll('a.scroll-link'),
	showClothing = document.querySelectorAll('.show-clothing');

//  cart
const openModal = () => modalCart.classList.add('show');
const closeModal = () => modalCart.classList.remove('show')
const getGoods = () => fetch('db/db.json')
				.then(response => response.json());

buttonCart.addEventListener('click', openModal);
modalCart.addEventListener('click', event => {
	if (event.target.classList.contains('overlay') || event.target.classList.contains('modal-close')) closeModal();
});

// scroll smooth
{
	for (const scrollLink of scrollLinks) scrollLink.addEventListener('click', event => {
		event.preventDefault();
		const id = scrollLink.getAttribute('href');
		document.querySelector(id).scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	})
}

// goods
const createCard = ({ label, img, name, description, price}) => {

	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';
	card.innerHTML = (`
		<div class="goods-card">
			${label ? `<span class="label">${label}</span>` : ''}
			<img src=${'db/' + img} alt="image: Hoodie" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="007">
				<span class="button-price">$${price}</span>
			</button>
		</div>
	`);
	
	return card;
};

const renderCards = data => {
	longGoodsList.textContent = '';
	longGoodsList.append(...data.map(createCard));
	document.body.classList.add('show-goods');
};

more.addEventListener('click', event => {
	event.preventDefault();
	getGoods().then(renderCards);
});

const filterCards = (field, value) => {
	field ? getGoods()
			.then(data => data.filter(good => good[field] === value))
			.then(renderCards) :
			getGoods().then(renderCards);
};

navigationLink.forEach(link => {
	link.addEventListener('click', event => {
		event.preventDefault();
		const field = link.dataset.field;
		const value = link.textContent;
		filterCards(field, value);
	})
});

const smoothScroll = () => {
	document.body.scrollIntoView({
		behavior: "smooth",
		block: "start"
	});
};

showAcsesories.forEach(item => item.addEventListener('click', event => {
	event.preventDefault();
	filterCards('category', 'Accessories');
	smoothScroll();
}));

showClothing.forEach(item => item.addEventListener('click', event => {
	event.preventDefault();
	filterCards('category', 'Clothing');
	smoothScroll();
}));
