const firebaseApp = firebase.initializeApp({
	apiKey: "AIzaSyD55hWzofdzvhaq7Rl11rm72cXTM3WJDLY",
	authDomain: "hdgd-classes.firebaseapp.com",
	databaseURL: "https://hdgd-classes.firebaseio.com",
	projectId: "hdgd-classes",
	storageBucket: "hdgd-classes.appspot.com",
	messagingSenderId: "539712798069"
})
const db = firebaseApp.database();
const studentsRef = db.ref('students');

const auth = firebase.auth();



const vm = new Vue({
	el: '#app',
	firebase: {
		students: studentsRef,
		startingDate: db.ref('startingDate')
	},
	data: {
		multiplier: 2,
		email: "",
		password: "",
		userIsLoggedIn: false
	},
	computed: {
		orderedStudents: function () {
			return _.orderBy(this.students, 'name')
		}
	},
	mounted: function (){
		const now = new Date();
		const today = now.getDay();

		// Thuesday or Thursday
		// 1 hour, so it's single class multiplier
		if (today === 2 || today === 4) {
			this.multiplier = 1;
		}
	},
	beforeCreate: function(){
		auth.onAuthStateChanged(firebaseUser => {
			if (firebaseUser) {
				console.log(firebaseUser);
				this.userIsLoggedIn = true;
			} else {
				console.log('Not logged in');
			}
		});
	},
	methods: {
		increaseTime: function(student) {
			const newHours = parseInt(student['hours']) + parseInt(this.multiplier);

			this.saveTime(student, newHours);
		},
		decreaseTime: function(student) {
			const newHours = parseInt(student['hours']) - parseInt(this.multiplier);

			this.saveTime(student, newHours);
		},
		saveTime: function(student, newHours){
			// We have user logged in, we can save to DB
			if ( firebase.auth().currentUser ) {
				studentsRef.child(student['id']).child('hours').set(newHours)
			}
		},
		logIn: function() {
			const promise = auth.signInWithEmailAndPassword(this.email, this.password);
			promise.catch(e => console.log(e.message));
		}
	}
})
