import './module/smoothscroll.min.js';
import './module/mySwiper.js';
import smootnScroll from './module/smoothScroll.js';

// init variables
const buttonCart = document.querySelector('.button-cart'),
	modalCart = document.querySelector('#modal-cart'),
	more = document.querySelector('.more'),
	navigationLink = document.querySelectorAll('.navigation-link'),
	longGoodsList = document.querySelector('.long-goods-list'),
	showAccessories = document.querySelectorAll('.show-acsessories'),
	showClothing = document.querySelectorAll('.show-clothing'),
	cartTableGoods = document.querySelector('.cart-table__goods'),
	cartTableTotal = document.querySelector('.card-table__total'),
	cartCount = document.querySelector('.cart-count'),
	cartClear = document.querySelector('.cart-clear'),
	modalForm = document.querySelector('.modal-form');

//  cart
const openModal = () => {
	cart.renderCart();
	modalCart.classList.add('show');
};
const closeModal = () => modalCart.classList.remove('show')

const checkGoods = () => {
	const data = [];
	return () => (data.length ? data : data.push(...fetch('./db/db.json').then(response => response.json())));
}

// const getGoods = checkGoods; 
const getGoods = () => fetch('db/db.json').then(response => response.json()); 

buttonCart.addEventListener('click', openModal);
modalCart.addEventListener('click', event => {
	if (event.target.classList.contains('overlay') || event.target.classList.contains('modal-close')) closeModal();
});

const cart = {
	cartGoods: JSON.parse(localStorage.getItem('cart')) || [],
	updateLocalStorage() {
		localStorage.setItem('cart', JSON.stringify(this.cartGoods));
	},
	cartGoodsCount() {
		return this.cartGoods.length;
	},
	quantity() {
		const count = this.cartGoods.reduce((sum, item) => sum + item.count, 0);
		cartCount.textContent = count ? count : '';
	},
	renderCart() {
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({ id, name, price, count }) => {
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.thObject = '${goods}';
			trGood.dataset.thId = '*{id}';
			trGood.dataset.id = id;
			trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus">+</button></td>
				<td>$${price * count}</td>
				<td><button class="cart-btn-delete">x</button></td>
			`;
			cartTableGoods.append(trGood);
		});

		const totalPrice = this.cartGoods.reduce((sum, item) => {
			return sum + item.price * item.count;
		}, 0);

		cartTableTotal.textContent = '$' + totalPrice;
	},
	addCartGoods(id) {
		const goodItem = this.cartGoods.find(item => item.id === id);
		goodItem ? this.plusGood(id) : getGoods()
										.then(data => data.find(item => item.id === id))
										.then(({ id, name, price }) => {
											this.cartGoods.push({ id, name, price, count: 1 });
											this.updateLocalStorage();
											this.quantity();										
										});
	},
	deleteGood(id) {
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		this.renderCart();
		this.updateLocalStorage();
		this.quantity();
	},
	minusGood(id) {
		for (const item of this.cartGoods) {
			if (item.id === id) item.count > 1 ? item.count -= 1 : this.deleteGood(id);
		}
		this.renderCart();
		this.updateLocalStorage();
		this.quantity();
	},
	plusGood(id) {
		for (const item of this.cartGoods) {
			if (item.id === id) {
				item.count += 1;
				break;
			}
		}
		this.renderCart();
		this.updateLocalStorage();
		this.quantity();
	},
	clearCart() {
		this.cartGoods.length = 0;
		this.renderCart();
		this.updateLocalStorage();
		this.quantity();
	},
}
cartCount.textContent = cart.cartGoodsCount();

document.addEventListener('click', event => {
	const addToCart = event.target.closest('.add-to-cart');
	if (addToCart) cart.addCartGoods(addToCart.dataset.id);
	cart.renderCart();
})

cartTableGoods.addEventListener('click', event => {
	const target = event.target;
	if (target.tagName === 'BUTTON') {
		const id = target.closest('.cart-item').dataset.id;
		if (target.classList.contains('cart-btn-delete')) cart.deleteGood(id);
		if (target.classList.contains('cart-btn-minus')) cart.minusGood(id);
		if (target.classList.contains('cart-btn-plus')) cart.plusGood(id);
	}
})

cartClear.addEventListener('click', event => {
	event.preventDefault();
	cart.clearCart();
})

// goods
const createCard = ({ id, label, img, name, description, price}) => {

	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';
	card.innerHTML = (`
		<div class="goods-card">
			${label ? `<span class="label">${label}</span>` : ''}
			<img src=${'db/' + img} alt="image: Hoodie" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id=${id}>
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

const filterCards = (field, value) => {
	field ? getGoods()
			.then(data => data.filter(good => good[field] === value))
			.then(renderCards) :
			getGoods().then(renderCards);
};

more.addEventListener('click', event => {
	event.preventDefault();
	getGoods().then(renderCards);
});

navigationLink.forEach(link => link.addEventListener('click', event => {
		event.preventDefault();
		const field = link.dataset.field;
		const value = link.textContent;
		filterCards(field, value);
}));

showAccessories.forEach(item => item.addEventListener('click', event => {
	event.preventDefault();
	filterCards('category', 'Accessories');
	smoothScroll();
}));

showClothing.forEach(item => item.addEventListener('click', event => {
	event.preventDefault();
	filterCards('category', 'Clothing');
	smoothScroll();
}));

// send data to server
const postData = data => fetch('/buy', {
	method: 'POST',
	body: JSON.stringify(data),
	headers: {
		'Content-Type': 'application/json;charset=utf-8'
	},
});

const validForm = data => {
	let valid = false;
	for (const [, value] of data) {
		if (value.trim()) {
			valid = true;
		} else {
			valid = false;
			alert('Empty field!');
			break;
		}
	}
	return valid;
};

modalForm.addEventListener('submit', event => {
	event.preventDefault();
	const formData = new FormData(modalForm);

	if (validForm(formData) && cart.cartGoodsCount()) {
		const data = {};
		for ( const [ name, value ] of formData) {
			data[name] = value;
		}
		data.cart = cart.cartGoods;
		
		formData.append('cart', JSON.stringify(cart.cartGoods));
		cart.updateLocalStorage();
		postData(data)
		.then(response => {
			if (!response.ok) {
				throw new Error(response.status)
			}
			alert('Your goods sent!');
		})
		.catch(error => alert('Error: ' + error))
		.finally(() => {
			closeModal();
			modalForm.reset();
			cart.clearCart();
		});		
	} else {
		if (validForm(formData)) {
			alert('Cart empty!');
			closeModal();
		}
	}
})

// init
smootnScroll();
cart.quantity();
