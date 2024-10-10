import './login.css';

const Login = () => {

	return (
		<div className="form-container">
			<div className='top'>
				<button>Sign in</button>
				<button className='inactive-button'>Register</button>
			</div>
			<form className='bottom'>
				<div className="input-fields">
					<div>
						<input type="text" placeholder='Email ID' />
					</div>
					<div>
						<input type="password" placeholder='Password' />
					</div>
				</div>

				<div className="action-fields">
					<p>Forgot password?</p>
				</div>
				<button className='login-btn'>Login</button>
			</form>
		</div>
	)
}

export default Login;
