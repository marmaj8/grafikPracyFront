<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-toolbar-title>
          Grafik Pracy
        </q-toolbar-title>

        <div v-if="this.$q.sessionStorage.getItem('token_type') != null">
          <q-btn color="secondary" label="Wyloguj" @click="wyloguj" />
        </div>
        <div v-if="this.$q.sessionStorage.getItem('token_type') == null">
          <q-btn type="a" href="#/login" label="Zaloguj" push/>
        </div>
      </q-toolbar>
    </q-header>

    <q-footer elevated>
      <q-toolbar class="glossy">
        <q-btn
          v-go-back=" '/' "
          color="secondary"
          label="Powrót"
        />
      </q-toolbar>
    </q-footer>

    

    <q-drawer
      v-if="this.$q.sessionStorage.getItem('token_type') != null"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Menu</q-item-label>
        <q-item clickable tag="a" href="#/dane">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Moje Dane</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" href="#/grafik-moj">
          <q-item-section avatar>
            <q-icon name="work" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mój Grafik</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="this.$q.sessionStorage.getItem('uzytkownik_admin') == true" clickable tag="a" href="#/pracownicy">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Pracownicy</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="this.$q.sessionStorage.getItem('uzytkownik_admin') == true" clickable tag="a" href="#/grafiki">
          <q-item-section avatar>
            <q-icon name="list_alt" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Grafiki</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="this.$q.sessionStorage.getItem('uzytkownik_admin') == true" clickable tag="a" href="#/stanowiska">
          <q-item-section avatar>
            <q-icon name="place" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Stanowiska</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" href="#/urlopy">
          <q-item-section avatar>
            <q-icon name="beach_access" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Urlopy</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import Login from "../components/Login";

export default {
  name: 'MyLayout',

  data () {
    return {
      leftDrawerOpen: false
    }
  },
  methods: {
      wyloguj: function () {
        this.$q.sessionStorage.remove('uzytkownik_id')
        this.$q.sessionStorage.remove('uzytkownik_nazwa')
        this.$q.sessionStorage.remove('uzytkownik_admin')
        //this.$q.sessionStorage.remove('uzytkownik')
        this.$q.sessionStorage.remove('access_token')
        this.$q.sessionStorage.remove('token_type')
        
        localStorage.clear()

        this.$router.push("/login")
      }
  },
  created() {
    
    if(localStorage.access_token != null)
    {
      this.$q.sessionStorage.set('uzytkownik_id', localStorage.uzytkownik_id )
      this.$q.sessionStorage.set('uzytkownik_nazwa', localStorage.uzytkownik_nazwa )
      this.$q.sessionStorage.set('uzytkownik_admin', localStorage.uzytkownik_admin)
      this.$q.sessionStorage.set('access_token', localStorage.access_token)
      this.$q.sessionStorage.set('token_type', localStorage.token_type)
    }
    else if(this.$q.sessionStorage.getItem('access_token') == null)
      this.$router.push("/login")
  }
}
</script>
