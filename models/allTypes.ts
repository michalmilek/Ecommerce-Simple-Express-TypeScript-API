export interface ProductInterface {
	name: string;
	description: string;
	richDescription: string;
	image: string;
	images: string[];
	brand: string;
	price: number;
	category: CategoryInterface;
	countInStock: number;
	rating: number;
	isFeatured: boolean;
	dataCreated: Date;
}

export interface OrdersInterface {
	orderItems: OrderItemInterface[];
	shippingAddress1: string;
	shippingAddress2: string;
	city: string;
	zip: string;
	country: string;
	phone: string;
	status: number;
	totalPrice: number;
	user: UserInterface;
	dateOrdered: Date;
}

export interface OrderItemInterface {
	quantity: number;
	product: ProductInterface;
}

export interface UserInterface {
	name: string;
	email: string;
	password: string;
	street: string;
	apartment: string;
	zip: string;
	city: string;
	country: string;
	phone: string;
	isAdmin: boolean;
}

export interface CategoryInterface {
	name: string;
	icon: string;
	color: string;
	image: string;
}
