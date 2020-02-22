<template>
  <q-page class="flex flex-center">
    
  <div class="q-pa-md" style="max-width: 300px">
    <form @submit.prevent.stop="onSubmit" @reset.prevent.stop="onReset" class="q-gutter-md">
      
      <q-input
        ref="username"
        filled
        v-model="username"
        type="email"
        label="Email"
        hint=""
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Prosze wprowadzić email']"
      />

      <q-input
        ref="password"
        filled
        :type="isPwd ? 'password' : 'text'"
        v-model="password"
        label="Hasło"
        hint=""
        lazy-rules
        :rules="[
          val => val && val.length > 0 || 'Proszę wprowadzić hasło'
        ]"
      />

      <div>
        <q-btn label="Zaloguj" type="submit" color="primary" />
      </div>
    </form>
  </div>
    
    <div class="q-pa-md">
      <div class="q-gutter-md col items-start">

      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      password: '',
      isPwd: true,
      username: '',
    }
  },

  methods: {
    onSubmit () {
      this.$refs.username.validate()
      this.$refs.password.validate()

      if (this.$refs.username.hasError || this.$refs.password.hasError) {
        this.formHasError = true
      }
      else {
        let body = new URLSearchParams();
        body.set('grant_type', 'password');
        body.set('password', this.password);
        body.set('username', this.username);


        this.$axios.post('token', body, {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
          .then((response) => {

            var access_token = response.data.access_token;
            var token_type = response.data.token_type;


            this.$axios.get('api/pracownik/get', {
              headers: {
                Authorization: token_type + " " + access_token
              }
            })
            .then((response) => {
              

              //this.$q.sessionStorage.set('uzytkownik', response.data)
              this.$q.sessionStorage.set('uzytkownik_id', response.data.Id)
              this.$q.sessionStorage.set('uzytkownik_nazwa', response.data.Imie + " " + response.data.Nazwisko)
              this.$q.sessionStorage.set('uzytkownik_admin', response.data.Administrator)
              this.$q.sessionStorage.set('access_token', access_token)
              this.$q.sessionStorage.set('token_type', token_type)

              this.$router.push("/")
            })
            .catch((error) => {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Błąd',
                icon: 'report_problem'
              })

            })
          })
          .catch((error) => {

            if (error.response == null || error.response.status === 404)
            {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Problem w połączeniu z bazą danych.\nProszę spróbować później.',
                icon: 'report_problem'
              })
            }
            else
            {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Nieprawidłowy Email lub Hasło',
                icon: 'report_problem'
              })
            }
          })
      }
    }
  }
}
</script>
