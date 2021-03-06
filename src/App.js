import React from "react";
import "./App.css";
import axios from "axios";

const intitalState = {
	name: "",
	email: "",
	amount: "",
	username: "",

	name_error: "",
	email_error: "",
	amount_error: "",
	username_error: "",

	loading: "",
};

const str =
	"public-7751:B-qa2-0-5f031cbe-0-302d021500890ef262296563accd1cb4aab790323d2fd570d30214510bcdacdaa4f03f59477eef13f2af5ad13e3044";
const KEY = btoa(str);

const EMAIL_REG = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

const API_URL = {
  create_customer:
  // api-key for createcusteomer
		"https://n5np1597r7.execute-api.ap-south-1.amazonaws.com/dev/create-customer",
  payment:
// payment api key for customer
		"https://n5np1597r7.execute-api.ap-south-1.amazonaws.com/dev/payment",
  customer_id:
  // get-customer key
		"https://n5np1597r7.execute-api.ap-south-1.amazonaws.com/dev/get-customer",
};

class App extends React.Component {
	state = intitalState;

	checkout = async (token, id) => {
		this.setState({ loading: "" });
		await window.paysafe.checkout.setup(
			KEY,

			{
				currency: "USD",
				amount: this.state.amount * 100,
				singleUseCustomerToken: token,
				customerId: id,
				customer: {
					firstName: this.state.name,
					lastName: "ayush",
					email: this.state.email,
					phone: "7027027024",
					dateOfBirth: {
						day: 1,
						month: 7,
						year: 1990,
					},
				},
				billingAddress: {
					nickName: this.state.name,
					street: "India",
					street2: "India",
					city: "India",
					zip: "95014",
					country: "IN",
					state: "CA",
				},
				locale: "en_US",
				environment: "TEST",
				merchantRefNum: this.state.username,
				canEditAmount: false,
				merchantDescriptor: {
					dynamicDescriptor: "XYZ",
					phone: "1234567890",
				},
				displayPaymentMethods: ["card"],
				paymentMethodDetails: {
					paysafecard: {
						consumerId: "1232323",
					},
				},
				payoutConfig: {
					minimumAmount: 1,
				},
			},
			(instance, error, result) => {
				if (result && result.paymentHandleToken) {
					result["merchantRefNum"] = this.state.username;
					result["currency"] = "USD";
					result["custId"] = id;

					axios
						.post(API_URL.payment, {
							data: result,
						})
						.then((res) => {
							//console.log(res);
							if (res.data.message === "successful") {
								instance.showSuccessScreen(res.data.paymentId);
							} else {
								instance.showFailureScreen();
							}
						})
						.catch((err) => {
							console.log(err);
							instance.showFailureScreen();
							if (instance.isOpen()) instance.close();
						});
				} else {
					// error handle
					alert("Server Down,Please try again");
					this.setState(intitalState);
				}
			},
			(stage, expired) => {
				//console.log(stage);
				switch (stage) {
					case "PAYMENT_HANDLE_NOT_CREATED": // Handle the scenario
					case "PAYMENT_HANDLE_CREATED": // Handle the scenario
					case "PAYMENT_HANDLE_REDIRECT": // Handle the scenario
					case "PAYMENT_HANDLE_PAYABLE": // Handle the scenario
					default: // Handle the scenario
				}
				this.setState(intitalState);
			}
		);
	};

	getCustomerId = async (body) => {
		try {
			const res = await axios.post(API_URL.customer_id, {
				data: body,
			});
			this.checkout(res.data.token, res.data.id);
		} catch (err) {
			alert("User not found");
			this.setState(intitalState);
		}
	};


  handleChange =(e,key)=>{
  this.setState({
    [key]:e.target.value
  })
  }


	validForm = () => {
		let error_happen = false;
		if (this.state.username === "") {
			error_happen = true;
			this.setState({ username_error: "Enter Valid Username" });
		}
		if (this.state.name === "") {
			error_happen = true;
			this.setState({ name_error: "Enter Valid Name" });
		}

		if (this.state.email === "" || !EMAIL_REG.test(this.state.email)) {
			error_happen = true;
			this.setState({ email_error: "Enter Valid Email" });
		}
		if (parseInt(this.state.amount) <= 0) {
			error_happen = true;
			this.setState({ amount_error: "Amount Should Be Number Greater 0" });
		}

		if (error_happen) return false;
		return true;
	};

	makePayment = () => {
		if (this.validForm()) {
			this.setState({ loading: "Loading" });
			const body = {
				merchantRefNum: this.state.username,
				name: this.state.name,
			};
			axios
				.post(API_URL.create_customer, {
					data: body,
				})
				.then(async (res) => {
					if (res.data.message === "successful") {
						this.getCustomerId(body);
					} else {
						alert("User Already registerd, Choose another username");
						this.setState(intitalState);
						console.log("went wrong");
					}
				})
				.catch(() => {
					alert("Please try again something went wrong");
					this.setState(intitalState);
				});
		} else {
			alert("Check The Form");
		}
	};

	render() {
		return (
			<div className="center">
				

				<div className="center-less ui container">
					<div className="ui segment">
						{this.state.loading !== "" ? (
							<div className="ui active inverted dimmer">
								<div className="ui text loader">{this.state.loading}</div>
							</div>
						) : null}

						<form className="ui form">
							<h4 className="ui dividing header">Information</h4>
							<div className="field">
								<div className="two fields">
									<div className="field">
										<div className="error">{this.state.username_error}</div>
										<label>Username</label>
										<input
											type="text"
											name="username"
											placeholder="Username"
											value={this.state.username}
											onChange={(e)=>this.handleChange(e,'username')}
										/>
									</div>
									<div className="field">
										<div className="error">{this.state.name_error}</div>
										<label>Name</label>
										<input
											type="text"
											name="lastName"
											placeholder="Name"
											onChange={(e)=>this.handleChange(e,'name')}
											value={this.state.name}
										/>
									</div>
								</div>
							</div>
							<div className="two field">
								<div className="field">
									<div className="error">{this.state.email_error}</div>

									<label>Email</label>
									<input
										type="text"
										name="amount"
										placeholder="email address"
										value={this.state.email}
										onChange={(e)=>this.handleChange(e,'email')}
									/>
								</div>
								<div className="field">
									<div className="error">{this.state.amount_error}</div>
									<label>Amount</label>
									<input
										type="number"
										name="amount"
										placeholder="USD"
										min="1"
										value={this.state.amount}
										onChange={(e)=>this.handleChange(e,'amount')}
									></input>
								</div>
							</div>
							<div
								className="ui button"
								onClick={this.makePayment}
								tabIndex="0"
							>
								Donate
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export default App;