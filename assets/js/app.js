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
    configuration: false,
    email: ``,
    multiplier: 2,
    password: ``,
    students: false,
    userIsLoggedIn: false,
    listMode: false,
    translations: {
      done: `Done`,
      doubleClass: `Double class`,
      fromDate: `From %s`,
      hour: `hour`,
      hours: `hours`,
      listMode: `List Mode`,
      logIn: `Log in`,
      logOut: `Log out`,
      minimumAssistance: `Minimum assistance set to %s%`,
      on: `ON`,
      off: `OFF`,
      required: `Required`,
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
        // eslint-disable-next-line no-console
        console.log(`Signed in`)
        this.userIsLoggedIn = true
        this.$bindAsArray(`students`, db.ref(`students`))
        this.$bindAsObject(`configuration`, db.ref(`config`))
      } else {
        // eslint-disable-next-line no-console
        console.log(`Not logged in`)
      }
    })
  },
  methods: {
    increaseTime(student) {
      const newHours = parseInt(student.hours) + parseInt(this.multiplier)

      this.saveTime(student, newHours)
    },
    decreaseTime(student) {
      const newHours = parseInt(student.hours) - parseInt(this.multiplier)

      this.saveTime(student, newHours)
    },
    saveTime(student, newHours) {
      // We have user logged in, we can save to DB
      if (firebase.auth().currentUser) {
        db.ref(`students`).child(student.id).child(`hours`).set(newHours)
      }
    },
    percentage(studentHours) {
      let percentage = false

      if (studentHours > 0) {
        percentage = ((studentHours * 100) / this.configuration.requiredHours).toFixed(1)
      }

      return percentage
    },
    logIn(event) {
      event.target.disabled = true
      const promise = auth.signInWithEmailAndPassword(this.email, this.password)

      promise.catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e.message)
        event.target.disabled = false
      })
    },
    logOut() {
      const that = this

      auth.signOut().then(() => {
        // eslint-disable-next-line no-console
        console.log(`Signed Out`)
        // Empty students for security
        that.students = false
      }, (error) => {
        // eslint-disable-next-line no-console
        console.error(`Sign Out Error`, error)
      })
    }
  }
})
