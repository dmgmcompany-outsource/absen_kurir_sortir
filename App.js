import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, Modal, ScrollView, ActivityIndicator, Image, Linking, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import * as Location from 'expo-location'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// ==================================================================
// ✅ KONFIGURASI APLIKASI
// ==================================================================

// 1. Link Google Script (PASTIKAN INI URL DEPLOY TERBARU BAPAK)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxky4rELDgIuqVCEXTvXNBv10i_9WJ5P_psmTyges4ktYYz199Bh4keLWFsEVLn0x6B/exec"; 

// 2. Link Grup WhatsApp
const LINK_GRUP_WA = "https://chat.whatsapp.com/EefWb5Q0v7SFDhcapB0Snn";

// 3. Link Logo
const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/2830/2830305.png"; 

// ==================================================================
// ✅ DATA WILAYAH BERTINGKAT
// ==================================================================
const DATA_WILAYAH = {
  "Jawa Timur": {
    "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo", "Gresik", "Banyuwangi", "Kediri", "Madiun", "Mojokerto", "Pasuruan", "Probolinggo", "Blitar", "Batu", "Lamongan", "Tuban", "Bojonegoro", "Ngawi", "Magetan", "Ponorogo", "Pacitan", "Trenggalek", "Tulungagung", "Nganjuk", "Jombang", "Lumajang", "Jember", "Bondowoso", "Situbondo", "Bangkalan", "Sampang", "Pamekasan", "Sumenep"]
  },
  "Bali": {
    "Bali": ["Denpasar", "Badung", "Gianyar", "Tabanan", "Bangli", "Buleleng", "Jembrana", "Karangasem", "Klungkung"]
  },
  "Nusa Tenggara": {
    "Nusa Tenggara Barat": ["Mataram", "Bima", "Lombok Barat", "Lombok Tengah", "Lombok Timur", "Lombok Utara", "Sumbawa", "Sumbawa Barat", "Dompu"],
    "Nusa Tenggara Timur": ["Kupang", "Flores Timur", "Sikka", "Ende", "Ngada", "Manggarai", "Sumba Timur", "Sumba Barat", "Alor", "Lembata", "Rote Ndao", "Labuan Bajo"]
  },
  "Kalimantan": {
    "Kalimantan Barat": ["Pontianak", "Singkawang", "Kubu Raya", "Sambas", "Sintang"],
    "Kalimantan Tengah": ["Palangka Raya", "Kotawaringin Barat", "Kotawaringin Timur", "Kapuas"],
    "Kalimantan Selatan": ["Banjarmasin", "Banjarbaru", "Banjar", "Tabalong", "Tanah Bumbu"],
    "Kalimantan Timur": ["Samarinda", "Balikpapan", "Bontang", "Kutai Kartanegara", "Kutai Timur", "Berau"],
    "Kalimantan Utara": ["Tarakan", "Bulungan", "Nunukan", "Malinau"]
  },
  "Sulawesi": {
    "Sulawesi Selatan": ["Makassar", "Gowa", "Maros", "Bone", "Palopo", "Parepare", "Bulukumba", "Jeneponto", "Takalar", "Bantaeng", "Sinjai", "Soppeng", "Wajo", "Sidrap", "Pinrang", "Enrekang", "Luwu", "Tana Toraja", "Toraja Utara", "Selayar"],
    "Sulawesi Barat": ["Mamuju", "Majene", "Polewali Mandar", "Mamasa", "Pasangkayu"],
    "Sulawesi Tenggara": ["Kendari", "Baubau", "Konawe", "Kolaka", "Muna", "Buton", "Wakatobi"],
    "Sulawesi Tengah": ["Palu", "Poso", "Donggala", "Toli-Toli", "Luwuk", "Morowali", "Parigi Moutong"],
    "Sulawesi Utara": ["Manado", "Bitung", "Tomohon", "Kotamobagu", "Minahasa", "Bolaang Mongondow"],
    "Gorontalo": ["Gorontalo", "Limboto", "Bone Bolango", "Pohuwato"]
  },
  "Papua": {
    "Papua": ["Jayapura", "Keerom", "Sarmi", "Biak Numfor", "Yapen"],
    "Papua Barat": ["Sorong", "Manokwari", "Fakfak", "Kaimana", "Raja Ampat"],
    "Papua Tengah": ["Nabire", "Mimika (Timika)", "Puncak Jaya"],
    "Papua Selatan": ["Merauke", "Boven Digoel", "Mappi"],
    "Papua Pegunungan": ["Wamena (Jayawijaya)", "Yahukimo"]
  }
};

export default function App() {
  const [halaman, setHalaman] = useState('LOADING'); 
  const [dataUser, setDataUser] = useState(null);
  const [dataPagi, setDataPagi] = useState(null); 
  const [isSending, setIsSending] = useState(false);

  // --- CEK MEMORI HP (AUTO LOGIN) ---
  useEffect(() => { cekLoginOtomatis(); }, []);

  const cekLoginOtomatis = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@user_data');
      if (jsonValue != null) {
        setDataUser(JSON.parse(jsonValue));
        setHalaman('MENU_UTAMA');
      } else {
        setHalaman('LOGIN');
      }
    } catch(e) { setHalaman('LOGIN'); }
  };

  // ✅ FUNGSI LOGOUT (DIPERBAIKI AGAR JALAN DI NETLIFY/WEB)
  const logout = async () => {
    // Fungsi Hapus Data
    const processLogout = async () => {
        try {
          await AsyncStorage.removeItem('@user_data'); 
          setDataUser(null); 
          setHalaman('LOGIN'); 
        } catch (e) {
          Alert.alert("Error", "Gagal Logout");
        }
    };

    // Cek Platform: Jika Web pakai confirm, Jika HP pakai Alert
    if (Platform.OS === 'web') {
        if (window.confirm("Keluar Aplikasi?\nApakah Anda yakin ingin mengganti akun?")) {
            processLogout();
        }
    } else {
        Alert.alert("Keluar Aplikasi", "Apakah Anda yakin ingin mengganti akun?", [
          { text: "Batal", style: "cancel" },
          { text: "YA, KELUAR", onPress: processLogout }
        ]);
    }
  };

  // ==================================================================
  // 1. HALAMAN LOGIN (TIDAK DIUBAH)
  // ==================================================================
  const LoginScreen = () => {
    const [nama, setNama] = useState('');
    const [idKaryawan, setIdKaryawan] = useState('');
    const [kota, setKota] = useState('Pilih Area Tugas');
    const [peran, setPeran] = useState('KURIR'); 
    
    const [modalKotaVisible, setModalKotaVisible] = useState(false);
    const [modalIDVisible, setModalIDVisible] = useState(false);
    
    const [stepWilayah, setStepWilayah] = useState(1); 
    const [selectedRegion, setSelectedRegion] = useState(null); 
    const [selectedProv, setSelectedProv] = useState(null); 
    
    const daftarID = Array.from({length: 200}, (_, i) => "DMGM-" + String(i + 1).padStart(3, '0'));

    const handleLogin = async () => {
      if (!nama || !idKaryawan || kota.includes('Pilih')) { 
        Alert.alert("Data Belum Lengkap", "Mohon isi Nama, ID, dan Kota!"); 
        return; 
      }
      const userBaru = { nama, id: idKaryawan, kota, role: peran };
      try {
        await AsyncStorage.setItem('@user_data', JSON.stringify(userBaru));
        setDataUser(userBaru);
        setHalaman('MENU_UTAMA');
      } catch (e) { Alert.alert("Error", "Gagal simpan login"); }
    };

    const getListItems = () => {
      if (stepWilayah === 1) return Object.keys(DATA_WILAYAH);
      else if (stepWilayah === 2) return Object.keys(DATA_WILAYAH[selectedRegion]);
      else if (stepWilayah === 3) return DATA_WILAYAH[selectedRegion][selectedProv];
      return [];
    };

    const handleSelect = (item) => {
      if (stepWilayah === 1) { setSelectedRegion(item); setStepWilayah(2); } 
      else if (stepWilayah === 2) { setSelectedProv(item); setStepWilayah(3); } 
      else if (stepWilayah === 3) { setKota(item); setModalKotaVisible(false); setStepWilayah(1); }
    };

    const handleBack = () => { if (stepWilayah > 1) setStepWilayah(stepWilayah - 1); };

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.header}>
            <View style={styles.logoContainer}><Image source={{ uri: LOGO_URL }} style={styles.logoImage} /></View>
            <Text style={styles.title}>PIC CONTROLLING</Text>
            <Text style={styles.subtitle}>Sistem Monitoring & Absensi</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>PILIH JABATAN ANDA:</Text>
            <View style={{flexDirection:'row', marginBottom:15}}>
              <TouchableOpacity style={[styles.tabBtn, peran==='KURIR' ? styles.tabActive : {backgroundColor:'#eee'}]} onPress={()=>{setPeran('KURIR'); setIdKaryawan('');}}>
                  <Text style={{color: peran==='KURIR'?'white':'black', fontWeight:'bold'}}>🛵 KURIR</Text>
              </TouchableOpacity>
              <View style={{width:10}}/>
              <TouchableOpacity style={[styles.tabBtn, peran==='HELPER' ? styles.tabActive : {backgroundColor:'#eee'}]} onPress={()=>{setPeran('HELPER'); setIdKaryawan('');}}>
                  <Text style={{color: peran==='HELPER'?'white':'black', fontWeight:'bold'}}>📦 HELPER</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>DATA DIRI:</Text>
            <TextInput style={styles.input} placeholder="Nama Lengkap" value={nama} onChangeText={setNama} />
            <TouchableOpacity style={[styles.input, {flexDirection:'row', justifyContent:'space-between', alignItems:'center'}]} onPress={() => setModalIDVisible(true)}>
                <Text style={{color: idKaryawan ? 'black' : '#999', fontSize: 16}}>{idKaryawan || "Pilih Nomor Kartu (DMGM-XXX)"}</Text>
                <Ionicons name="chevron-down" size={20} color="#999"/>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.input, {flexDirection:'row', justifyContent:'space-between', alignItems:'center'}]} onPress={() => { setStepWilayah(1); setModalKotaVisible(true); }}>
               <Text style={{color: kota.includes('Pilih') ? '#999' : 'black', fontSize:16}}>{kota}</Text>
               <Ionicons name="map" size={20} color="#999"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnBlue} onPress={handleLogin}><Text style={styles.btnText}>MASUK APLIKASI</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnWA} onPress={() => Linking.openURL(LINK_GRUP_WA)}>
              <Ionicons name="people" size={18} color="white" style={{marginRight:8}} />
              <Text style={styles.btnTextSmall}>PUSAT BANTUAN (GRUP WA)</Text>
            </TouchableOpacity>
          </View>
          <View style={{padding: 20, alignItems:'center'}}><Text style={styles.footerBrand}>PT. DANA MULTI GLOBAL MANDIRI</Text></View>
        </ScrollView>

        <Modal transparent={true} visible={modalKotaVisible} onRequestClose={() => setModalKotaVisible(false)}>
          <View style={styles.modalBg}><View style={styles.modalBox}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:15, borderBottomWidth:1, borderColor:'#eee', paddingBottom:10}}>
                {stepWilayah > 1 && (<TouchableOpacity onPress={handleBack}><Ionicons name="arrow-back" size={24} color="#0056b3" /></TouchableOpacity>)}
                <Text style={{fontWeight:'bold', fontSize:16}}>{stepWilayah === 1 ? "PILIH WILAYAH BESAR" : (stepWilayah === 2 ? `PROVINSI (${selectedRegion})` : `KOTA/KAB (${selectedProv})`)}</Text>
                <TouchableOpacity onPress={()=>setModalKotaVisible(false)}><Ionicons name="close" size={24} color="red" /></TouchableOpacity>
            </View>
            <ScrollView>{getListItems().map((item, i)=>(<TouchableOpacity key={i} style={styles.modalItem} onPress={() => handleSelect(item)}><Text style={{fontSize:16, color:'#333'}}>{item}</Text><Ionicons name="chevron-forward" size={18} color="#ccc" /></TouchableOpacity>))}</ScrollView>
          </View></View>
        </Modal>

        <Modal transparent={true} visible={modalIDVisible} onRequestClose={() => setModalIDVisible(false)}>
          <View style={styles.modalBg}><View style={styles.modalBox}>
            <Text style={{fontWeight:'bold', marginBottom:10, textAlign:'center'}}>PILIH NOMOR KARTU:</Text>
            <ScrollView style={{maxHeight: 400}}>{daftarID.map((id,i)=> (<TouchableOpacity key={i} style={styles.modalItem} onPress={()=>{setIdKaryawan(id); setModalIDVisible(false)}}><Text style={{fontSize:16, fontWeight:'bold', color:'#0056b3'}}>{id}</Text></TouchableOpacity>))}</ScrollView>
            <TouchableOpacity style={{padding:15, alignItems:'center'}} onPress={()=>setModalIDVisible(false)}><Text style={{color:'red'}}>Batal</Text></TouchableOpacity>
          </View></View>
        </Modal>
      </View>
    );
  };

  // ==================================================================
  // 2. LAYAR HELPER (PERBAIKAN: LOADING DIPISAH & TOMBOL KELUAR)
  // ==================================================================
  const SorterScreen = () => {
    const [jam, setJam] = useState('');
    // ✅ PERBAIKAN: Pisahkan status loading agar tidak muter barengan
    const [loadingMasuk, setLoadingMasuk] = useState(false);
    const [loadingPulang, setLoadingPulang] = useState(false);
    
    const [foto, setFoto] = useState(null); 

    useEffect(() => { setInterval(() => setJam(new Date().toLocaleTimeString('id-ID')), 1000); }, []);

    const ambilFoto = async () => {
      let result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.3 });
      if (!result.canceled) { setFoto(result.assets[0].uri); }
    };

    const kirimAbsensiSorter = async (statusAbsen) => {
       if (!foto) { Alert.alert("WAJIB FOTO", "Mohon ambil foto selfie/lokasi terlebih dahulu sebelum absen!"); return; }

       // ✅ Tentukan tombol mana yang loading
       if (statusAbsen === 'Masuk') setLoadingMasuk(true);
       else setLoadingPulang(true);
       
       let { status } = await Location.requestForegroundPermissionsAsync();
       if (status !== 'granted') { 
           Alert.alert("Izin Ditolak", "Wajib nyalakan GPS!"); 
           setLoadingMasuk(false); setLoadingPulang(false); // Stop loading
           return; 
       }
       
       let location = await Location.getCurrentPositionAsync({});
       const gpsCoord = `${location.coords.latitude},${location.coords.longitude}`;

       const dataKirim = {
         kategori: "absensi",
         nama: dataUser.nama,
         id: dataUser.id,
         status: statusAbsen,
         lokasi_gps: gpsCoord,
         wilayah: dataUser.kota
       };

       try {
         await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify(dataKirim) });
         Alert.alert("✅ BERHASIL", `Absen ${statusAbsen} tercatat!\nLokasi: Terkunci`, [
             { text: "OK", onPress: () => setFoto(null) } 
         ]);
       } catch (error) {
         Alert.alert("❌ GAGAL", "Cek koneksi internet Anda.");
       } finally {
         // ✅ Matikan loading sesuai tombolnya
         setLoadingMasuk(false);
         setLoadingPulang(false);
       }
    };

    return (
      <View style={styles.container}>
         <View style={styles.headerSmall}>
            <View>
              <Text style={{color:'white', fontWeight:'bold', fontSize:14}}>{dataUser.nama}</Text>
              <Text style={{color:'#ddd', fontSize:12}}>ID: {dataUser.id}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
               <Text style={{color:'white', fontSize:11, marginRight:5, fontWeight:'bold'}}>KELUAR</Text>
               <Ionicons name="log-out-outline" size={20} color="white" />
            </TouchableOpacity>
         </View>

         <View style={{flex:1, justifyContent:'center', padding:20}}>
            <Text style={{textAlign:'center', fontSize:40, fontWeight:'bold', marginBottom:10, color:'#333'}}>{jam}</Text>
            <Text style={{textAlign:'center', color:'#666', marginBottom:40}}>Posisi: HELPER / SORTER</Text>
            <Text style={{textAlign:'center', color:'#0056b3', fontWeight:'bold', marginBottom:20}}>Area: {dataUser.kota}</Text>

            <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#555', marginBottom:20}]} onPress={ambilFoto}>
                <Text style={{color:'white', fontWeight:'bold', fontSize:16}}>
                   📷 {foto ? "FOTO TERSIMPAN (SIAP KIRIM)" : "AMBIL FOTO BUKTI (WAJIB)"}
                </Text>
            </TouchableOpacity>

            {/* ✅ Tombol Masuk hanya baca loadingMasuk */}
            <TouchableOpacity 
              style={[styles.bigBtn, {backgroundColor: foto ? '#27ae60' : '#bdc3c7'}]} 
              onPress={() => kirimAbsensiSorter('Masuk')} 
              disabled={loadingMasuk || loadingPulang || !foto}
            >
              {loadingMasuk ? <ActivityIndicator color="white"/> : <><Ionicons name="finger-print" size={40} color="white" /><Text style={styles.bigBtnText}>ABSEN MASUK</Text></>}
            </TouchableOpacity>

            <View style={{height:20}}/>

            {/* ✅ Tombol Pulang hanya baca loadingPulang */}
            <TouchableOpacity 
              style={[styles.bigBtn, {backgroundColor: foto ? '#c0392b' : '#bdc3c7'}]} 
              onPress={() => kirimAbsensiSorter('Pulang')} 
              disabled={loadingMasuk || loadingPulang || !foto}
            >
              {loadingPulang ? <ActivityIndicator color="white"/> : <><Ionicons name="walk" size={40} color="white" /><Text style={styles.bigBtnText}>ABSEN PULANG</Text></>}
            </TouchableOpacity>
         </View>
      </View>
    );
  };

  // ==================================================================
  // 3. LAYAR KURIR (TIDAK DIUBAH)
  // ==================================================================
  const KurirScreen = () => {
    const [tab, setTab] = useState('MASUK'); 
    const [jam, setJam] = useState('');
    const [lokasi, setLokasi] = useState(null); 
    const [foto, setFoto] = useState(null);
    const [jmlSortir, setJmlSortir] = useState(''); 
    const [jmlSukses, setJmlSukses] = useState(''); 
    const [jmlGagal, setJmlGagal] = useState('');   

    useEffect(() => { setInterval(() => setJam(new Date().toLocaleTimeString('id-ID')), 1000); }, []);

    const dapatkanGPS = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert("Izin Ditolak", "Wajib nyalakan GPS!"); return null; }
      let location = await Location.getCurrentPositionAsync({});
      return location.coords;
    };

    const ambilLokasi = async () => {
      const coords = await dapatkanGPS();
      if (coords) { setLokasi(coords); Alert.alert("Sukses", "Lokasi Anda terkunci!"); }
    };

    const ambilFoto = async () => {
      let result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.3 });
      if (!result.canceled) { setFoto(result.assets[0].uri); }
    };

    const kirimSOS = async () => {
      Alert.alert("BAHAYA", "Kirim sinyal DARURAT?", [
        { text: "BATAL", style: "cancel" },
        { text: "KIRIM!", onPress: async () => {
            const gps = await dapatkanGPS();
            if(gps){
               const dataDarurat = { jenis: 'SOS', nama: dataUser.nama, id_kurir: dataUser.id, area: dataUser.kota, total_paket: 0, sukses: 0, gagal: 0, lokasi_gps: `${gps.latitude}, ${gps.longitude}` };
               fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify(dataDarurat) });
               const linkMaps = `http://maps.google.com/?q=${gps.latitude},${gps.longitude}`;
               const pesan = `🚨 *SOS! DARURAT!* 🚨%0A%0ANama: ${dataUser.nama}%0AID: ${dataUser.id}%0AArea: ${dataUser.kota}%0ALokasi: ${linkMaps}%0A%0AMohon Bantuan Segera!`;
               Linking.openURL(`whatsapp://send?text=${pesan}`);
            }
        }}
      ]);
    };

    const laporPosisi = async () => {
      const gps = await dapatkanGPS();
      if(gps){
          const linkMaps = `http://maps.google.com/?q=${gps.latitude},${gps.longitude}`;
          const pesan = `📍 *LAPOR POSISI (SPOT CHECK)*%0A%0ANama: ${dataUser.nama}%0AWaktu: ${jam}%0AArea: ${dataUser.kota}%0APosisi: ${linkMaps}`;
          Linking.openURL(`whatsapp://send?text=${pesan}`);
      }
    };

    const validasiDanKirim = async () => {
      if (!lokasi) { Alert.alert("Wajib GPS", "Klik tombol 'Ambil Lokasi' dulu!"); return; }
      
      let jenis = tab === 'MASUK' ? 'PAGI' : 'SORE';
      let sukses = tab === 'MASUK' ? 0 : jmlSukses;
      let gagal = tab === 'MASUK' ? 0 : jmlGagal;
      let beban = tab === 'MASUK' ? jmlSortir : dataPagi;

      if (tab === 'MASUK' && !jmlSortir) return Alert.alert("Isi Data", "Masukkan jumlah paket!");
      if (tab === 'PULANG' && !jmlSukses) return Alert.alert("Isi Data", "Masukkan paket sukses!");

      if(tab === 'MASUK') setDataPagi(jmlSortir);

      setIsSending(true);
      
      const dataKirim = { 
          jenis: jenis, 
          nama: dataUser.nama, 
          id_kurir: dataUser.id, 
          area: dataUser.kota, 
          total_paket: beban || 0, 
          sukses: sukses || 0, 
          gagal: gagal || 0, 
          lokasi_gps: `${lokasi.latitude},${lokasi.longitude}` 
      };

      try {
        await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify(dataKirim) });
        setIsSending(false);
        
        let pesanWA = tab === 'MASUK' 
            ? `*LAPORAN MASUK (PAGI)*%0A%0ANama: ${dataUser.nama}%0AID: ${dataUser.id}%0AArea: ${dataUser.kota}%0A📦 Bawa: ${beban} Paket%0A📍 Lokasi: Terkunci`
            : `*LAPORAN PULANG (SORE)*%0A%0ANama: ${dataUser.nama}%0AArea: ${dataUser.kota}%0A✅ Sukses: ${sukses}%0A❌ Retur: ${gagal}%0A📍 Lokasi: Terkunci`;
        
        Alert.alert("Berhasil!", "Data masuk. Lanjut Lapor ke Grup?", [
            { text: "YA", onPress: () => { 
                Linking.openURL(`whatsapp://send?text=${pesanWA}`);
                setFoto(null); setLokasi(null); if(jenis==='PAGI') setTab('PULANG'); 
            }}
        ]);
      } catch (error) { setIsSending(false); Alert.alert("Gagal", "Cek koneksi internet!"); }
    };

    return (
      <View style={styles.container}>
        <View style={styles.headerSmall}>
           <View>
              <Text style={{color:'white', fontWeight:'bold', fontSize:14}}>{dataUser?.nama}</Text>
              <Text style={{color:'#ddd', fontSize:12}}>Kurir ID: {dataUser?.id}</Text>
           </View>
           <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
             <Text style={{color:'white', fontSize:11, marginRight:5, fontWeight:'bold'}}>KELUAR</Text>
             <Ionicons name="log-out-outline" size={20} color="white" />
           </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabBtn, tab==='MASUK' && styles.tabActive]} onPress={() => setTab('MASUK')}><Text style={{color: tab==='MASUK'?'white':'#666'}}>ABSEN PAGI</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab==='PULANG' && styles.tabActive]} onPress={() => setTab('PULANG')}><Text style={{color: tab==='PULANG'?'white':'#666'}}>ABSEN SORE</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{paddingBottom: 40}}>
          <View style={styles.card}>
            <Text style={{textAlign:'center', fontSize:32, fontWeight:'bold', marginBottom:15}}>{jam}</Text>
            
            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:15}}>
              <TouchableOpacity style={[styles.miniBtn, {backgroundColor:'#3498db'}]} onPress={laporPosisi}>
                <Ionicons name="location" size={16} color="white" />
                <Text style={{color:'white', fontSize:12, fontWeight:'bold'}}> SPOT CHECK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.miniBtn, {backgroundColor:'#e74c3c'}]} onPress={kirimSOS}>
                <Ionicons name="warning" size={16} color="white" />
                <Text style={{color:'white', fontSize:12, fontWeight:'bold'}}> SOS DARURAT</Text>
              </TouchableOpacity>
            </View>
            <View style={{height:1, backgroundColor:'#eee', marginBottom:15}} />

            {tab === 'MASUK' ? (
              <View>
                  <Text style={{marginBottom:5, fontWeight:'bold'}}>Total Paket Dibawa:</Text>
                  <TextInput style={styles.inputBig} placeholder="0" keyboardType="numeric" value={jmlSortir} onChangeText={setJmlSortir} />
              </View>
            ) : (
              <View>
                  <Text style={{marginBottom:5, fontWeight:'bold'}}>Laporan Hasil:</Text>
                  <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                      <TextInput style={[styles.inputBig, {borderColor:'green', width:'48%'}]} placeholder="Sukses" keyboardType="numeric" value={jmlSukses} onChangeText={(t)=>{ setJmlSukses(t); if(dataPagi) setJmlGagal(dataPagi - t); }} />
                      <TextInput style={[styles.inputBig, {borderColor:'red', width:'48%'}]} placeholder="Gagal" value={String(jmlGagal)} editable={false} />
                  </View>
              </View>
            )}

            <TouchableOpacity style={[styles.actionBtn, {backgroundColor: lokasi ? '#2ecc71' : '#f39c12'}]} onPress={ambilLokasi}>
                <Text style={{color:'white', fontWeight:'bold'}}>
                    {lokasi ? "✅ LOKASI TERSIMPAN" : "📍 AMBIL LOKASI (WAJIB)"}
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionBtn, {backgroundColor:'#555', marginTop:5}]} onPress={ambilFoto}><Text style={{color:'white'}}>📷 {foto ? "Foto Tersimpan" : "Ambil Foto Bukti"}</Text></TouchableOpacity>
            
            <TouchableOpacity style={[styles.btnBlue, {marginTop:20, backgroundColor: isSending ? '#ccc' : '#0056b3'}]} disabled={isSending} onPress={validasiDanKirim}>
              {isSending ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>KIRIM & LAPOR</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // --- NAVIGASI UTAMA ---
  if (halaman === 'LOADING') return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large" color="#0056b3"/></View>;
  if (halaman === 'LOGIN') return <LoginScreen />;
  
  if (dataUser?.role === 'HELPER') return <SorterScreen />;
  return <KurirScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eee' },
  header: { backgroundColor: '#0056b3', height: 250, justifyContent: 'center', alignItems: 'center', paddingTop: 20 },
  headerSmall: { backgroundColor: '#0056b3', height: 90, flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingTop:30 },
  logoContainer: { backgroundColor: 'white', padding: 10, borderRadius: 20, marginBottom: 10 },
  logoImage: { width: 60, height: 60, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: '#dbeafe' },
  card: { backgroundColor: 'white', marginHorizontal: 20, marginTop: -40, padding: 20, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  label: { fontSize:12, fontWeight:'bold', color:'#555', marginBottom:5 },
  input: { backgroundColor:'#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth:1, borderColor:'#ddd' },
  inputBig: { backgroundColor:'white', borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:15, fontSize:18, textAlign:'center', marginBottom:10 },
  btnBlue: { backgroundColor: '#0056b3', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnWA: { backgroundColor: '#25D366', padding: 10, borderRadius: 10, alignItems: 'center', marginTop:10, flexDirection:'row', justifyContent:'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  btnTextSmall: { color: 'white', fontWeight: 'bold', fontSize:12 },
  footerBrand: { color: '#0056b3', fontSize: 12, fontWeight: 'bold' },
  actionBtn: { padding:12, borderRadius:8, alignItems:'center', justifyContent:'center', marginTop:5 },
  miniBtn: { flex:0.48, padding:10, borderRadius:8, flexDirection:'row', justifyContent:'center', alignItems:'center' },
  modalBg: { flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center' },
  modalBox: { backgroundColor:'white', margin:30, padding:20, borderRadius:15, maxHeight:400 },
  modalItem: { padding:15, borderBottomWidth:1, borderColor:'#eee', flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  tabContainer: { flexDirection:'row', margin:15, backgroundColor:'white', borderRadius:10, padding:5 },
  tabBtn: { flex:1, padding:12, alignItems:'center', borderRadius:8 },
  tabActive: { backgroundColor:'#0056b3' },
  bigBtn: { padding: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  bigBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  logoutBtn: { flexDirection:'row', alignItems:'center', padding:5, backgroundColor:'rgba(255,255,255,0.2)', borderRadius:5 }
});