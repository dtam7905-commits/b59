/* B59CLUB - ĐỒNG BỘ SỐ DƯ DEMO */

(function () {
    "use strict";

    const KEY = "b59_balance";
    const DEFAULT_BALANCE = 1000000;

    const listeners = new Set();

    // Lấy số dư
    function read() {
        const value = Number(localStorage.getItem(KEY));

        return Number.isFinite(value) && value >= 0
            ? Math.floor(value)
            : DEFAULT_BALANCE;
    }

    // Thông báo thay đổi
    function notify() {
        const value = read();

        listeners.forEach(callback => {
            try {
                callback(value);
            } catch (error) {
                console.error(error);
            }
        });

        window.dispatchEvent(
            new CustomEvent("b59balancechange", {
                detail: { balance: value }
            })
        );
    }

    // Lưu số dư
    function write(value) {
        const amount = Number(value);

        if (!Number.isFinite(amount) || amount < 0) {
            throw new Error("Số dư không hợp lệ");
        }

        localStorage.setItem(KEY, String(Math.floor(amount)));

        notify();

        return read();
    }

    // Khởi tạo số dư
    if (localStorage.getItem(KEY) === null) {
        localStorage.setItem(KEY, DEFAULT_BALANCE);
    }

    // Các chức năng dùng chung
    window.B59Balance = {

        // Lấy số dư
        get: function () {
            return read();
        },

        // Cập nhật số dư
        set: function (value) {
            return write(value);
        },

        // Cộng xu
        add: function (amount) {
            const n = Number(amount);

            if (!Number.isFinite(n) || n < 0) {
                throw new Error("Số xu không hợp lệ");
            }

            return write(read() + Math.floor(n));
        },

        // Trừ xu
        subtract: function (amount) {
            const n = Number(amount);

            if (!Number.isFinite(n) || n < 0) {
                throw new Error("Số xu không hợp lệ");
            }

            const current = read();
            const cost = Math.floor(n);

            if (cost > current) {
                return false;
            }

            write(current - cost);

            return read();
        },

        // Theo dõi thay đổi số dư
        subscribe: function (callback) {
            if (typeof callback !== "function") {
                return function () {};
            }

            listeners.add(callback);

            callback(read());

            return function () {
                listeners.delete(callback);
            };
        }
    };

    // Đồng bộ giữa các tab
    window.addEventListener("storage", function (event) {
        if (event.key === KEY) {
            notify();
        }
    });

})();
