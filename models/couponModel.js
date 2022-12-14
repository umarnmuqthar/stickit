const { ObjectId } = require('mongodb')
const getDb = require('../utils/database').getDb

class Coupon {
  constructor (couponCode, amount, minPurchase, expiresOn) {
    this.couponCode = couponCode
    this.amount = amount
    this.minPurchase = minPurchase
    this.expiresOn = expiresOn
    this.createdOn = new Date()
    this.updatedOn = new Date()
  }

  save () {
    const db = getDb()
    return db
      .collection('coupons')
      .insertOne(this)
      .then((result) => {
        console.log(result)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  static fetchAll () {
    const db = getDb()
    return db
      .collection('coupons')
      .find({ deleted: { $ne: true } })
      .sort({ createdOn: -1 })
      .toArray()
  }

  static fetchByCouponCode (couponCode) {
    const db = getDb()
    return db
      .collection('coupons')
      .findOne({ couponCode })
  }

  static fetchActive () {
    const db = getDb()
    return db
      .collection('coupons')
      .find({ active: true, deleted: { $ne: true } })
      .sort({ createdOn: -1 })
      .toArray()
  }

  static update (id, data) {
    const db = getDb()
    return db
      .collection('coupons')
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: data
        }
      )
      .then((result) => {
        console.log(result)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  static softDelete (id) {
    const db = getDb()
    return db
      .collection('coupons')
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: { deleted: true }
        }
      )
      .then((result) => {
        console.log(result)
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

module.exports = Coupon
