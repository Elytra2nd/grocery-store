// resources/js/ziggy.js
const Ziggy = {
    "url": "http://localhost",
    "port": null,
    "defaults": {},
    "routes": {
        "dashboard": {
            "uri": "dashboard",
            "methods": ["GET", "HEAD"]
        },
        "admin.dashboard": {
            "uri": "admin/dashboard",
            "methods": ["GET", "HEAD"]
        },
        "admin.products.index": {
            "uri": "admin/products",
            "methods": ["GET", "HEAD"]
        },
        "admin.products.create": {
            "uri": "admin/products/create",
            "methods": ["GET", "HEAD"]
        },
        "admin.products.store": {
            "uri": "admin/products",
            "methods": ["POST"]
        },
        "admin.products.show": {
            "uri": "admin/products/{product}",
            "methods": ["GET", "HEAD"],
            "parameters": ["product"],
            "bindings": {"product": "id"}
        },
        "admin.products.edit": {
            "uri": "admin/products/{product}/edit",
            "methods": ["GET", "HEAD"],
            "parameters": ["product"],
            "bindings": {"product": "id"}
        },
        "admin.products.update": {
            "uri": "admin/products/{product}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["product"],
            "bindings": {"product": "id"}
        },
        "admin.products.destroy": {
            "uri": "admin/products/{product}",
            "methods": ["DELETE"],
            "parameters": ["product"],
            "bindings": {"product": "id"}
        },
        "admin.orders.index": {
            "uri": "admin/orders",
            "methods": ["GET", "HEAD"]
        },
        "profile.edit": {
            "uri": "profile",
            "methods": ["GET", "HEAD"]
        },
        "logout": {
            "uri": "logout",
            "methods": ["POST"]
        }
    }
};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}

export { Ziggy };
