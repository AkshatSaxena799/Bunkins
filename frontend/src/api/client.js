const API_BASE = '/api/v1';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('bunkins_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('bunkins_token', token);
        } else {
            localStorage.removeItem('bunkins_token');
        }
    }

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(method, path, body = null) {
        const options = {
            method,
            headers: this.getHeaders(),
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE}${path}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Something went wrong');
        }

        return data;
    }

    // Auth
    async register(email, password, fullName) {
        return this.request('POST', '/auth/register', {
            email,
            password,
            full_name: fullName,
        });
    }

    async login(email, password) {
        return this.request('POST', '/auth/login', { email, password });
    }

    async getMe() {
        return this.request('GET', '/auth/me');
    }

    // Products
    async getProducts(params = {}) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                query.append(key, value);
            }
        });
        return this.request('GET', `/products?${query.toString()}`);
    }

    async getProduct(identifier) {
        return this.request('GET', `/products/${identifier}`);
    }

    // Wishlist
    async getWishlist() {
        return this.request('GET', '/wishlist');
    }

    async addToWishlist(productId) {
        return this.request('POST', `/wishlist/${productId}`);
    }

    async removeFromWishlist(productId) {
        return this.request('DELETE', `/wishlist/${productId}`);
    }

    // Orders
    async createOrder(orderData) {
        return this.request('POST', '/orders', orderData);
    }

    async getOrders() {
        return this.request('GET', '/orders');
    }

    async getOrder(orderId) {
        return this.request('GET', `/orders/${orderId}`);
    }

    // Coupons
    async validateCoupon(code, orderTotal) {
        return this.request('POST', '/coupons/validate', {
            code,
            order_total: orderTotal,
        });
    }

    // Referrals
    async getMyReferralCode() {
        return this.request('GET', '/referrals/my-code');
    }

    async getReferralStats() {
        return this.request('GET', '/referrals/stats');
    }

    async applyReferral(referralCode) {
        return this.request('POST', '/referrals/apply', {
            referral_code: referralCode,
        });
    }

    async completeReferral(referralCode, orderId, refereeId) {
        return this.request('POST', '/referrals/complete', {
            referral_code: referralCode,
            order_id: orderId,
            referee_id: refereeId,
        });
    }

    // Dashboard
    async getDashboardStats() {
        return this.request('GET', '/dashboard/stats');
    }

    // Product Admin
    async createProduct(productData) {
        return this.request('POST', '/products', productData);
    }

    async updateProduct(productId, productData) {
        return this.request('PUT', `/products/${productId}`, productData);
    }

    async deleteProduct(productId) {
        return this.request('DELETE', `/products/${productId}`);
    }

    // Coupon Admin
    async getCoupons() {
        return this.request('GET', '/coupons');
    }

    async createCoupon(couponData) {
        return this.request('POST', '/coupons', couponData);
    }

    async deleteCoupon(couponId) {
        return this.request('DELETE', `/coupons/${couponId}`);
    }

    // Order Admin
    async updateOrderStatus(orderId, status) {
        return this.request('PATCH', `/orders/${orderId}/status`, { status });
    }

    // CMS
    async getCmsPages() {
        return this.request('GET', '/cms/pages/all');
    }

    async getCmsPage(slug) {
        return this.request('GET', `/cms/pages/${slug}`);
    }

    async createCmsPage(pageData) {
        return this.request('POST', '/cms/pages', pageData);
    }

    async updateCmsPage(pageId, pageData) {
        return this.request('PUT', `/cms/pages/${pageId}`, pageData);
    }

    async deleteCmsPage(pageId) {
        return this.request('DELETE', `/cms/pages/${pageId}`);
    }

    // Reviews
    async getReviews(productId) {
        return this.request('GET', `/reviews/${productId}`);
    }

    async createReview(reviewData) {
        return this.request('POST', '/reviews', reviewData);
    }

    async deleteReview(reviewId) {
        return this.request('DELETE', `/reviews/${reviewId}`);
    }

    // Newsletter
    async subscribeNewsletter(email) {
        return this.request('POST', '/newsletter', { email });
    }

    // Addresses
    async getAddresses() {
        return this.request('GET', '/addresses');
    }

    async createAddress(addressData) {
        return this.request('POST', '/addresses', addressData);
    }

    async updateAddress(addressId, addressData) {
        return this.request('PUT', `/addresses/${addressId}`, addressData);
    }

    async deleteAddress(addressId) {
        return this.request('DELETE', `/addresses/${addressId}`);
    }

    async setDefaultAddress(addressId) {
        return this.request('PATCH', `/addresses/${addressId}/default`);
    }

    // Profile
    async updateProfile(data) {
        return this.request('PATCH', '/auth/me', data);
    }

    async sendPhoneOtp(phone) {
        return this.request('POST', '/auth/send-phone-otp', { phone });
    }

    async verifyPhoneOtp(phone, code) {
        return this.request('POST', '/auth/verify-phone-otp', { phone, code });
    }
}

export const api = new ApiClient();
export default api;
