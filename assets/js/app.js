const firebaseApp = firebase.initializeApp({
  apiKey: `AIzaSyD55hWzofdzvhaq7Rl11rm72cXTM3WJDLY`,
  authDomain: `hdgd-classes.firebaseapp.com`,
  databaseURL: `https://hdgd-classes.firebaseio.com`,
  projectId: `hdgd-classes`,
  storageBucket: `hdgd-classes.appspot.com`,
  messagingSenderId: `539712798069`
})
const db = firebaseApp.database()

const auth = firebase.auth()

const vm = new Vue({
  el: `#app`,
  data: {
    email: ``,
    minimumPercentage: 80,
    multiplier: 2,
    password: ``,
    students: false,
    userIsLoggedIn: false,
    translations: {
      doubleClass: `Double class`,
      hour: `hour`,
      hours: `hours`,
      logIn: `Log in`,
      logOut: `Log out`,
      of: `of`,
      singleClass: `Single class`,
      siteTitle: `Assitance Tracking`,
      student: `Student`
    }
  },
  computed: {
    orderedStudents() {
      return _.orderBy(this.students, `name`)
    }
  },
  mounted() {
    const now = new Date()
    const today = now.getDay()

    // Thuesday or Thursday
    // 1 hour, so it's single class multiplier
    if (today === 2 || today === 4) {
      this.multiplier = 1
    }
  },
  beforeCreate() {
    auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        this.userIsLoggedIn = true
        this.$bindAsArray(`students`, db.ref(`students`))
      }
    })
  },
  methods: {
    increaseTime(student, kwanjangnim) {
        if (student) {
            const newHours = parseInt(student.hours) + parseInt(this.multiplier)

            this.updateStudentField(student, `hours`, newHours)
        }

        if (kwanjangnim) {
            // Increase the RequiredHours for all students
            for (var i = 0, len = this.students.length; i < len; i++) {
                const newRequiredHours = parseInt(this.students[i].requiredHours) + parseInt(this.multiplier)

                this.updateStudentField(this.students[i], `requiredHours`, newRequiredHours)
            }
        }
    },
    decreaseTime(student, kwanjangnim) {
        if (student) {
            const newHours = parseInt(student.hours) - parseInt(this.multiplier)

            this.updateStudentField(student, `hours`, newHours)
        }

        if (kwanjangnim) {
            // Decrease the RequiredHours for all students
            for (var i = 0, len = this.students.length; i < len; i++) {
                const newRequiredHours = parseInt(this.students[i].requiredHours) - parseInt(this.multiplier)

                this.updateStudentField(this.students[i], `requiredHours`, newRequiredHours)
            }
        }
    },
    updateStudentField(student, field, value) {
      // We have user logged in, we can save to DB
      if (firebase.auth().currentUser) {
          if (
            typeof student !== `undefined` &&
            typeof field !== `undefined` &&
            typeof value !== `undefined`) {
            db.ref(`students`).child(student.id).child(field).set(value)
          }
      }
    },
    percentage(student) {
      let percentage = false

      if (student.hours > 0) {
        percentage = ((student.hours * 100) / (student.requiredHours / 2)).toFixed(1)
      }

      return percentage
    },
    logIn(event) {
      event.target.disabled = true
      const promise = auth.signInWithEmailAndPassword(this.email, this.password)

      promise.catch((e) => {
        event.target.disabled = false
      })
    },
    logOut() {
      const that = this

      auth.signOut().then(() => {
        // Empty students for security
        that.students = false
      }, (error) => {
        // eslint-disable-next-line no-console
        console.error(`Sign Out Error`, error)
      })
    }
  }
})
