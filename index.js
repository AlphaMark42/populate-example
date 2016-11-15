var mongoose = require("mongoose");
var async = require("async");

var Schema = mongoose.Schema;
mongoose.connect("mongodb://localhost/populate");

var CountrySchema = new Schema({
	name: String,
	regions: [{
		type: Schema.ObjectId,
		ref: 'Region'
	}]
});

var RegionSchema = new Schema({
	_country: {
		type: Schema.ObjectId,
		ref: 'Country'
	},
	name: String,
	cities: [{
		type: Schema.ObjectId,
		ref: 'City'
	}]
});

var CitySchema = new Schema({
	_region: {
		type: Schema.ObjectId,
		ref: 'Region'
	},
	name: String
});

var CountryModel = mongoose.model('Country', CountrySchema);
var RegionModel = mongoose.model('Region', RegionSchema);
var CityModel = mongoose.model('City', CitySchema);

async.series([
	clearRecords.bind(CountryModel),
	clearRecords.bind(RegionModel),
	clearRecords.bind(CityModel),
	createCountry,
	createRegions,
	showRegions,
	createCities,
	showFullPopulate
]);


function showFullPopulate(callback) {
	console.log("");
	console.log("");
	console.log("");
	console.log("show full");

	CountryModel
		.find({ name: "Ukraine" })
		.populate({
			path: 'regions',
			model: 'Region',
			populate: {
				path: "cities",
				model: "City"
			}
		})
		.exec(function (err, fullUkraine) {
			if (err) throw err;
			console.log( JSON.stringify(fullUkraine, null, 2) );
		});

}

function createCities(callback){
	async.series([
		function(cb){
			RegionModel
				.findOne({name: "Zhytomyr"}, function(err, zhytomyr){
					if(err){ throw err; }
					else{
						var berdychiv = new CityModel({
							name: "Berdychiv",
							_region: zhytomyr._id
						});

						var olevsk = new CityModel({
							name: "Olevsk",
							_region: zhytomyr._id
						});

						berdychiv.save(function (err) {
							if (err) throw err;
							else console.log("Berdychiv is created");
						});

						olevsk.save(function (err) {
							if (err) throw err;
							else console.log("Olevsk is created");
						});

						zhytomyr.cities.push(berdychiv);
						zhytomyr.cities.push(olevsk);

						zhytomyr.save(function(err){
							if(err){
								throw err;
							}
							else{
								cb(null, "fifth");
							}
						});
					}
				})
		},
		function(cb){
			RegionModel
				.findOne({name: "Vinnitsa"}, function(err, vinnitsa){
					if(err){ throw err; }
					else{
						var zhazhkiv = new CityModel({
							name: "Zhazhkiv",
							_region: vinnitsa._id
						});

						var kozyatyn = new CityModel({
							name: "Kozyatyn",
							_region: vinnitsa._id
						});

						zhazhkiv.save(function (err) {
							if (err) throw err;
							else console.log("Zhazhkiv is created");
						});

						kozyatyn.save(function (err) {
							if (err) throw err;
							else console.log("Kozyatyn is created");
						});

						vinnitsa.cities.push(zhazhkiv);
						vinnitsa.cities.push(kozyatyn);

						vinnitsa.save(function(err){
							if(err){
								throw err;
							}
							else{
								cb(null, "fifth");
							}
						});
					}
				})
		}
	], function(){
		callback(null, "fifth")
	});
}

function showRegions(callback){
	CountryModel
		.findOne({ name: 'Ukraine' })
		.populate('regions')
		.exec(function (err, fullUkraine) {
			if (err) throw err;
			console.log(fullUkraine);
			callback(null, "fourth");
		})
}

function createRegions(callback){
	CountryModel.findOne({name: "Ukraine"}, function(err, ukr){
		var zhytomir = new RegionModel({
			name: "Zhytomyr",
			_country: ukr._id
		});

		var vinnitsa = new RegionModel({
			name: "Vinnitsa",
			_country: ukr._id
		});

		zhytomir.save(function (err) {
			if (err) throw err;
			else console.log("Zhytomyr is created");
		});

		vinnitsa.save(function (err) {
			if (err) throw err;
			else console.log("Vinnitsa is created");
		});

		ukr.regions.push(zhytomir);
		ukr.regions.push(vinnitsa);

		ukr.save(function(err){
			if(err){
				throw err;
			}
			else{
				callback(null, "three");
			}
		});
	});
}

function createCountry(callback){
	var ukraine = new CountryModel({ name: 'Ukraine' });

	ukraine.save(function(err){
		if (err){
			throw err;
		}
		else{
			console.log("Ukraine is created");
			callback(null, "two");
		}
	});
}

function clearRecords(callback){
	var model = this;
	model.remove({}, function(err){
		if(err) throw err;
		else{
			console.log("All data from %s was removed", model.modelName);
			callback(null, 'one ' + model.modelName);
		}
	});
}