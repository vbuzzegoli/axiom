import axs from "axios";

const clone = src => Object.assign({}, src);

const isUndefined = value => {
	// avoid re-assignment on older browser
	const undef = void 0;
	return value === undef;
};

const axiom = store => next => action => {
	if (!action.axiom) return next(action);
	const {
		log = false,
		xlog = false,
		axios = false,
		extractData = true,
		onSuccess = false,
		onError = false,
		onUnexpectedStatus = false,
		interceptors = false,
		_skip = false
	} = action.axiom;

	if (_skip) {
		return next(action);
	} else {
		// Core Process
		if (!axios) {
			return next(action);
		} else {
			const a = axs.create();

			if (interceptors.request) {
				a.interceptors.request.use(interceptors.request);
			}
			if (interceptors.response) {
				a.interceptors.response.use(interceptors.response);
			}

			if (log) console.log(`[Axios call..] - ${action.type}`);
			a(axios)
				.then(promise => {
					if (promise.status !== 200) {
						if (log) {
							console.log(`[Unexpected Response Status..] - ${action.type}`);
							if (xlog) console.log(`[Axiom done for: ${action.type}]`, action);
						}
						if (onUnexpectedStatus) {
							const newAction = clone(action);
							newAction.axiom._skip = true;
							onUnexpectedStatus(promise, newAction, next, store.dispatch);
						}
						throw new Error("UNEXPECTED_STATUS");
					} else {
						if (log) console.log(`[Valid Response..] - ${action.type}`);
						if (extractData && (axios.responseType === "json" || isUndefined(axios.responseType))) {
							if (log) console.log(`[Extracting Data..] - ${action.type}`);
							return promise.data;
						} else {
							return promise;
						}
					}
				})
				.then(res => {
					const newAction = clone(action);
					newAction.payload = res;
					newAction.axiom._skip = true;
					if (onSuccess) {
						if (log) if (xlog) console.log(`[Axiom done for: ${action.type}]`, action);
						onSuccess(newAction, next, store.dispatch);
					} else {
						if (log) {
							console.log(`[Dispatching..] - ${action.type}`);
							if (xlog) console.log(`[Axiom done for: ${action.type}]`, action);
						}
						next(newAction);
					}
				})
				.catch(err => {
					if (err.message === "UNEXPECTED_STATUS") {
						return;
					} else {
						if (log) {
							console.log(`[Error..] - ${action.type}`);
							if (xlog) console.log(`[Axiom done for: ${action.type}]`, action);
						}
						if (onError) {
							onError(err, action, next, store.dispatch);
						}
						return;
					}
				});
		}
	}
};

export default axiom;
