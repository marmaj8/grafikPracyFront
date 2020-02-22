<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-input
        filled
        v-model="szukaj.imie"
        label="Filtruj Imiona"
      />
      <q-input
        filled
        v-model="szukaj.nazwisko"
        label="Filtruj Nazwiska"
      />
    </div>
    <div class="row">
      <q-table class="col-12"
        :data="filtrowaniePracownicy"
        :columns="columns"
        row-key="Id"
        @row-click="rowclick"
        :pagination.sync="pagination"
      />
    </div>

      <div class="q-gutter-md row items-start">
        <q-item>
          <q-input
        filled
        v-model="pracownik.Imie"
        label="Imie"
        hint=""
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Prosze wprowadzić imie']"
      />
      
          <q-input
        filled
        v-model="pracownik.Nazwisko"
        label="Nazwisko"
        hint=""
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Prosze wprowadzić nazwisko']"
      />

          <q-input
        filled
        v-model="pracownik.Email"
        type="email"
        label="Email"
        hint=""
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Prosze wprowadzić email']"
      />

      <q-input
        filled
        :type="isPwd ? 'password' : 'text'"
        v-model="pracownik.Haslo"
        label="Hasło"
        hint=""
        lazy-rules
        :rules="[
          val => val && val.length > 0 || 'Proszę wprowadzić hasło'
        ]"
      />

      <q-input
        filled
        v-model="pracownik.GodzinWUmowie"
        label="Ilość Godzin"
        hint=""
        lazy-rules
        :rules="[
          val => val && val.length > 0 || 'Proszę wprowadzić ilość godzin'
        ]"
        mask="###" unmasked-value 
      />
      <q-btn color="secondary" label="Dodaj" @click="dodaj" />
        </q-item>
      </div>
  </div>
</template>

<script>
export default {
  name: "PageLogin",
  data() {
    return {
        isPwd: false,
        pracownik: {
            Imie: "",
            Nazwisko: "",
            Haslo: "",
            Email: "",
            GodzinWUmowie: "",
            Administrator: false
        },
        szukaj: {
          imie: '',
          nazwisko: ''
        },
        pracownicy: [],
        columns: [
        {
          name: "Id",
          required: true,
          label: "Nr",
          align: "left",
          field: "Id",
          sortable: true
        },
        {
          name: "Imie",
          align: "center",
          label: "Imie",
          field: "Imie",
          sortable: true
        },
        {
          name: "Nazwisko",
          align: "center",
          label: "Nazwisko",
          field: "Nazwisko",
          sortable: true
        },
        {
          name: "Email",
          align: "center",
          label: "Email",
          field: "Email",
          sortable: true
        },
        {
          name: "Godzin",
          align: "center",
          label: "Godzin",
          field: "GodzinWUmowie",
          sortable: true
        },
        {
          name: "Admin",
          align: "center",
          label: "Admin",
          field: "Administrator",
          sortable: true,
          format: (val, row) => {
            if (val == true) {
              return "TAK"
            }
              else return "NIE"
            }
        }
      ],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10
      },
    };
  },
  computed: {
    filtrowaniePracownicy: function() {
      return this.pracownicy.filter(
        p => p.Imie.includes(this.szukaj.imie)
        &&  p.Nazwisko.includes(this.szukaj.nazwisko))
    }
  },
  methods: {
    rowclick(vt, row) {
      this.$router.push("/pracownik?id=" + row.Id);
    },
    dodaj () {
        let body = new URLSearchParams()

        this.$axios.put('api/pracownik/put', this.pracownik, {
            headers: { 
                Authorization: this.$q.sessionStorage.getItem('token_type') + " " + this.$q.sessionStorage.getItem('access_token')
                ,'Content-Type': 'application/json' },
            
        })
        .then((response) => {
            this.pracownik.Id = response.data
            this.pracownicy.push( JSON.parse( JSON.stringify( this.pracownik )))
              this.$q.notify({
                color: 'positive',
                position: 'center',
                message: 'Dodano Pracownika',
                icon: 'report_problem'
              })
        })
        .catch((error) => {
            console.log(error)
            if (error.response == null)
            {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Brak połączenia z serwerem!',
                icon: 'report_problem'
              })
            }
            else if (error.response.status == 401) {
                this.$q.sessionStorage.remove('uzytkownik_id')
                this.$q.sessionStorage.remove('uzytkownik_nazwa')
                this.$q.sessionStorage.remove('uzytkownik_admin')
                //this.$q.sessionStorage.remove('uzytkownik')
                this.$q.sessionStorage.remove('access_token')
                this.$q.sessionStorage.remove('token_type')

                this.$router.push("/login")
            }
            else
            {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: error.response.data,
                icon: 'report_problem'
              })
            }
        })
    },
    wczytajDane() {
      this.$axios
        .get("api/pracownik/list", {
          headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token")
          }
        })
        .then(response => {
          this.pracownicy = response.data;
        })
        .catch(error => {
          if (error.response == null) {
            this.$q.notify({
              color: "negative",
              position: "center",
              message: "Brak połączenia z serwerem!",
              icon: "report_problem"
            });
          } else if (error.response.status == 401) {
            this.$q.sessionStorage.remove("uzytkownik_id");
            this.$q.sessionStorage.remove("uzytkownik_nazwa");
            this.$q.sessionStorage.remove("uzytkownik_admin");
            //this.$q.sessionStorage.remove('uzytkownik')
            this.$q.sessionStorage.remove("access_token");
            this.$q.sessionStorage.remove("token_type");

            this.$router.push("/login");
          } else {
            this.$q.notify({
              color: "negative",
              position: "center",
              message: error.response.data.Message,
              icon: "report_problem"
            });
          }
        });
    }
  },
  created() {
    this.wczytajDane();
  }
};
</script>
