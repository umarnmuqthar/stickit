const { ObjectId } = require("mongodb");

const cloudinary = require("../utils/cloudinary");

const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Coupon = require("../models/couponModel");
const Banner = require("../models/bannerModel");

exports.getLogin = async (req, res) => {
  res.render("admin/login");
};
exports.postLogin = async (req, res) => {
  res.redirect("/admin");
};

exports.postLogout = async (req, res) => {
  res.redirect("/admin/login");
};

exports.getHome = (req, res) => {
  res.render("admin/dashboard", { path: "/" });
};
exports.getProducts = (req, res) => {
  Category.fetchAll()
    .then((categories) => categories)
    .then((categories) => {
      Product.fetchAll().then((products) => {
        res.render("admin/products", {
          path: "/products",
          categories,
          products,
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddProduct = (req, res) => {
  const { productTitle, productCategory, productPrice, discount, stock } =
    req.body;
  const imgPromises = req.files.map((image) =>
    cloudinary.uploader.upload(image.path, {
      folder: "product_images",
      unique_filename: true,
    })
  );
  Promise.allSettled(imgPromises)
    .then((results) => {
      return (imgUrls = results.map((result) => result.value.secure_url));
    })
    .then((imgUrls) => {
      const newProduct = new Product(
        productTitle,
        productCategory,
        productPrice,
        discount,
        stock,
        imgUrls
      );
      newProduct
        .save()
        .then(() => {
          console.log("Product Added");
          res.redirect("/admin/products");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postEditProduct = async (req, res) => {
  const { id } = req.body;
  const updatedProduct = {
    productTitle: req.body.productTitle,
    category: ObjectId(req.body.productCategory),
    productPrice: req.body.productPrice,
    discount: req.body.discount,
    stock: req.body.stock,
    updatedOn: new Date(),
  };
  if (req.files) {
    const imgPromises = req.files.map((image) =>
      cloudinary.uploader.upload(image.path, {
        folder: "product_images",
        unique_filename: true,
      })
    );
    const results = await Promise.allSettled(imgPromises);
    const imgUrls = results.map((result) => result.value.secure_url);
    updatedProduct.imgUrls = imgUrls;
  }
  await Product.update(id, updatedProduct);
  res.redirect("/admin/products");
};
exports.postDeleteProduct = async (req, res) => {
  const { id } = req.body;
  console.log(id);
  await Product.softDelete(id);
  res.redirect("/admin/products");
};

exports.getCategories = async (req, res) => {
  const categories = await Category.fetchAll();
  res.render("admin/categories", { path: "/categories", categories });
};
exports.postAddCategory = (req, res) => {
  const categoryName = req.body.categoryName.toLowerCase();
  const newCategory = new Category(categoryName);
  newCategory
    .save()
    .then(() => {
      console.log("Category Added");
      res.redirect("/admin/categories");
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postEditCategory = async (req, res) => {
  const { id } = req.body;
  const updatedCategory = {
    categoryName: req.body.categoryName,
    updatedOn: new Date(),
  };
  await Category.update(id, updatedCategory);
  res.redirect("/admin/categories");
};
exports.postDeleteCategory = async (req, res) => {
  const { id } = req.body;
  console.log(id);
  await Category.softDelete(id);
  res.redirect("/admin/categories");
};

exports.getOrders = (req, res) => {
  res.render("admin/orders", { path: "/orders" });
};
exports.getInvoice = (req, res) => {
  const orderId = req.params.orderId;
  res.render("admin/invoice", { path: "/orders", orderId: orderId });
};

exports.getCoupons = (req, res) => {
  Coupon.fetchAll()
    .then((coupons) => {
      const changedCoupons = coupons.map((coupon) => {
        const dateString = coupon.expiresOn;
        const options = { year: "numeric", month: "short", day: "numeric" };
        coupon.expiresOn = new Date(dateString).toLocaleDateString(
          undefined,
          options
        );
        coupon.expiryDate = new Date(dateString).toISOString().substring(0, 10);
        return coupon;
      });
      res.render("admin/coupons", {
        path: "/coupons",
        coupons: changedCoupons,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postAddCoupon = (req, res) => {
  const couponCode = req.body.couponCode.toUpperCase();
  const createdOn = new Date();
  const expiresOn = new Date(req.body.expiresOn);
  const { amount, minPurchase } = req.body;
  const newCoupon = new Coupon(
    couponCode,
    amount,
    minPurchase,
    createdOn,
    expiresOn
  );
  newCoupon
    .save()
    .then(() => {
      console.log("Coupon Added");
      res.redirect("/admin/coupons");
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postEditCoupon = async (req, res) => {
  try {
    const { id } = req.body;
    const updatedCoupon = {
      couponCode: req.body.couponCode,
      amount: req.body.amount,
      minPurchase: req.body.minPurchase,
      expiresOn: new Date(req.body.expiresOn),
      updatedOn: new Date(),
    };
    await Coupon.update(id, updatedCoupon);
    res.redirect("/admin/coupons");
  } catch (error) {
    console.log(error);
  }
};
exports.postDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.body;
    await Coupon.softDelete(id);
    res.redirect("/admin/coupons");
  } catch (error) {
    console.log(error);
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.fetchAll();
    res.render("admin/banners", { path: "/banners", banners });
  } catch (error) {
    console.log(error);
  }
};
exports.postAddBanner = (req, res) => {
  const { bannerTitle } = req.body;
  cloudinary.uploader
    .upload(req.file.path, {
      folder: "banner_images",
      unique_filename: true,
    })
    .then((fileData) => {
      const newBanner = new Banner(bannerTitle, fileData.secure_url);
      newBanner
        .save()
        .then(() => {
          console.log("Banner Added");
          res.redirect("/admin/banners");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postEditBanner = async (req, res) => {
  try {
    console.log(req.file);
    const { id } = req.body;
    const updatedBanner = {
      bannerTitle: req.body.bannerTitle,
      updatedOn: new Date(),
    };
    if (req.file) {
      const file = await cloudinary.uploader.upload(req.file.path, {
        folder: "banner_images",
        unique_filename: true,
      });
      updatedBanner.imgUrl = file.secure_url;
    }
    await Banner.update(id, updatedBanner);
    res.redirect("/admin/banners");
  } catch (error) {
    console.log(error);
  }
};
exports.postDeleteBanner = async (req, res) => {
  try {
    const { id } = req.body;
    await Banner.softDelete(id);
    res.redirect("/admin/banners");
  } catch (error) {
    console.log(error);
  }
};

exports.getCustomers = (req, res) => {
  res.render("admin/customers", { path: "/customers" });
};
