<?php

class HalamanUtama extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Model', 'model');
    }

    public function index()
    {
        $data['kode'] = '401582';
        $data['satker'] = $this->model->get_seleksi_array('dim_satker', '', ['kode_satker' => 'ASC'])->result();
        $this->load->view('dashboard', $data);
    }

    public function show_eksekusi()
    {
        $kode = $this->input->post('kode');
        $tgl_awal = $this->input->post('tgl_awal');
        $tgl_akhir = $this->input->post('tgl_akhir');

        $where = [];
        if ($kode == '401582') {
            if (!empty($tgl_awal) && !empty($tgl_akhir)) {
                // Optimasi: Hindari fungsi DATE() di WHERE clause agar bisa menggunakan index
                $where = [
                    'permohonan_eksekusi >=' => $tgl_awal,
                    'permohonan_eksekusi <=' => $tgl_akhir
                ];
            }

            $query = $this->model->get_seleksi_array('fact_eksekusi', $where, ['permohonan_eksekusi' => 'DESC'])->result();
        } else {
            if (!empty($tgl_awal) && !empty($tgl_akhir)) {
                // Optimasi: Hindari fungsi DATE() di WHERE clause agar bisa menggunakan index
                $where = [
                    'kode_satker' => $kode,
                    'permohonan_eksekusi >=' => $tgl_awal,
                    'permohonan_eksekusi <=' => $tgl_akhir
                ];
            } else
                $where = ['kode_satker' => $kode];

            $query = $this->model->get_seleksi_array('fact_eksekusi', $where, ['permohonan_eksekusi' => 'DESC'])->result();
        }

        $data = [];
        foreach ($query as $row) {
            $data[] = [
                'nama_satker' => $row->nama_satker,
                'nomor_perkara_pn' => $row->nomor_perkara_pn,
                'nomor_register_eksekusi' => $row->nomor_register_eksekusi,
                'permohonan_eksekusi' => $row->permohonan_eksekusi,
                'penetapan_teguran_eksekusi' => $row->penetapan_teguran_eksekusi,
                'pelaksanaan_teguran_eksekusi' => $row->pelaksanaan_teguran_eksekusi,
                'penetapan_sita_eksekusi' => $row->penetapan_sita_eksekusi,
                'pelaksanaan_sita_eksekusi' => $row->pelaksanaan_sita_eksekusi
            ];
        }

        echo json_encode(['data_eksekusi' => $data]);
    }

    public function show_eksekusi_ht()
    {
        $kode = $this->input->post('kode');
        if ($kode == '401582') {
            $query = $this->model->get_seleksi_array('fact_eksekusi_ht', '', ['permohonan_eksekusi' => 'DESC'])->result();
        } else {
            $query = $this->model->get_seleksi_array('fact_eksekusi_ht', ['kode_satker' => $kode], ['permohonan_eksekusi' => 'DESC'])->result();
        }

        $data = [];
        foreach ($query as $row) {
            $data[] = [
                'nama_satker' => $row->nama_satker,
                'nomor_register_eksekusi' => $row->eksekusi_nomor_perkara,
                'permohonan_eksekusi' => $row->permohonan_eksekusi,
                'penetapan_teguran_eksekusi' => $row->penetapan_teguran_eksekusi,
                'pelaksanaan_teguran_eksekusi' => $row->pelaksanaan_teguran_eksekusi,
                'penetapan_sita_eksekusi' => $row->penetapan_sita_eksekusi,
                'pelaksanaan_sita_eksekusi' => $row->pelaksanaan_sita_eksekusi
            ];
        }

        echo json_encode(['data_eksekusi_ht' => $data]);
    }

    public function get_chart_beban_perkara()
    {
        $data = $this->model->get_chart_beban_perkara();
        echo json_encode($data);
    }

    public function get_pie_beban_perkara()
    {
        $kode_satker = $this->input->get('kode_satker', true);

        $data = $this->model->get_pie_beban_perkara($kode_satker);

        header('Content-Type: application/json');
        echo json_encode([
            'masuk' => (int) $data->perkara_masuk_tahun_ini,
            'sisa' => (int) $data->sisa_perkara_tahun_lalu
        ]);
    }

    public function show_jinayat()
    {
        $draw = $this->input->post('draw');
        $start = $this->input->post('start');
        $length = $this->input->post('length');

        $orderColumnIndex = $this->input->post('order')[0]['column'];
        $orderDir = $this->input->post('order')[0]['dir'];
        $searchValue = $this->input->post('search')['value'];

        $kode = $this->input->post('kode');
        $tgl_awal = $this->input->post('tgl_awal');
        $tgl_akhir = $this->input->post('tgl_akhir');

        $columns = [
            0 => 'nama_satker',
            1 => 'nomor_perkara',
            2 => 'jenis_perkara',
            3 => 'tanggal_pendaftaran',
            4 => 'tanggal_putusan',
            5 => 'jenis_hukuman',
            6 => 'nama_terdakwa',
            7 => 'usia'
        ];

        $orderColumn = isset($columns[$orderColumnIndex]) ? $columns[$orderColumnIndex] : 'tanggal_pendaftaran';

        // Base Query
        $this->db->from('v_perkara_jinayat');

        // FILTER KODE
        if ($kode !== '401582') {
            $this->db->where('kode_satker', $kode);
        }

        // FILTER TANGGAL (INDEX FRIENDLY)
        if (!empty($tgl_awal) && !empty($tgl_akhir)) {
            $this->db->where('tanggal_pendaftaran >=', $tgl_awal);
            $this->db->where('tanggal_pendaftaran <=', $tgl_akhir);
        }

        // SEARCH
        if (!empty($searchValue)) {
            $this->db->group_start();
            $this->db->like('nomor_perkara', $searchValue);
            $this->db->or_like('nama_terdakwa', $searchValue);
            $this->db->or_like('jenis_perkara', $searchValue);
            $this->db->group_end();
        }

        // CLONE untuk hitung filtered
        $dbClone = clone $this->db;
        $recordsFiltered = $dbClone->count_all_results('', FALSE);

        // ORDER
        $this->db->order_by($orderColumn, $orderDir);

        // LIMIT (INI KUNCI SERVER SIDE)
        $this->db->limit($length, $start);

        $query = $this->db->get();
        $result = $query->result();

        $data = [];
        $no = $start + 1;

        foreach ($result as $row) {
            $data[] = [
                $no++,
                $row->nama_satker,
                $row->nomor_perkara,
                $row->jenis_perkara,
                $row->tanggal_pendaftaran,
                $row->tanggal_putusan,
                $row->jenis_hukuman,
                $row->nama_terdakwa,
                $row->usia
            ];
        }

        // TOTAL DATA TANPA FILTER
        $this->db->from('v_perkara_jinayat');
        if ($kode !== '401582') {
            $this->db->where('kode_satker', $kode);
        }
        $recordsTotal = $this->db->count_all_results();

        echo json_encode([
            "draw" => intval($draw),
            "recordsTotal" => $recordsTotal,
            "recordsFiltered" => $recordsFiltered,
            "data" => $data
        ]);
    }

    public function get_chart_jinayat()
    {
        $kode = $this->input->post('kode_satker', true);
        $tgl_awal = $this->input->post('tgl_awal');
        $tgl_akhir = $this->input->post('tgl_akhir');

        if (!empty($tgl_awal) && !empty($tgl_akhir))
            $data = $this->model->get_chart_jinayat($kode, $tgl_awal, $tgl_akhir);
        else
            $data = $this->model->get_chart_jinayat($kode);
        header('Content-Type: application/json');
        foreach ($data as $row) {
            $row->jumlah = (int) $row->jumlah;
        }

        echo json_encode($data);
    }

    public function show_jinayat_kasasi()
    {
        $kode = $this->input->post('kode');
        $tgl_awal = $this->input->post('tgl_awal');
        $tgl_akhir = $this->input->post('tgl_akhir');

        $where = [];
        if ($kode == '401582') {
            if (!empty($tgl_awal) && !empty($tgl_akhir)) {
                // Optimasi: Hindari fungsi DATE() di WHERE clause agar bisa menggunakan index
                $where = [
                    'tanggal_permohonan_kasasi >=' => $tgl_awal,
                    'tanggal_permohonan_kasasi <=' => $tgl_akhir
                ];
            }

            $query = $this->model->get_seleksi_array('v_perkara_jinayat_kasasi', $where, ['tanggal_permohonan_kasasi' => 'DESC'])->result();
        } else {
            if (!empty($tgl_awal) && !empty($tgl_akhir)) {
                // Optimasi: Hindari fungsi DATE() di WHERE clause agar bisa menggunakan index
                $where = [
                    'kode_satker' => $kode,
                    'tanggal_permohonan_kasasi >=' => $tgl_awal,
                    'tanggal_permohonan_kasasi <=' => $tgl_akhir
                ];
            } else
                $where = ['kode_satker' => $kode];

            $query = $this->model->get_seleksi_array('v_perkara_jinayat_kasasi', $where, ['tanggal_permohonan_kasasi' => 'DESC'])->result();
        }

        $data = [];

        foreach ($query as $row) {
            $data[] = [
                'nama_satker' => $row->nama_satker,
                'nomor_perkara' => $row->nomor_perkara,
                'nomor_perkara_kasasi' => $row->nomor_perkara_kasasi,
                'jenis_perkara' => $row->jenis_perkara,
                'tanggal_permohonan_kasasi' => $row->tanggal_permohonan_kasasi,
                'tanggal_putusan_kasasi' => $row->tanggal_putusan_kasasi,
                'jenis_hukuman' => $row->jenis_hukuman,
                'status_putusan_kasasi' => $row->status_putusan_kasasi,
                'nama_terdakwa' => $row->nama_terdakwa,
                'usia' => $row->usia
            ];
        }

        echo json_encode(['data_jinayat_kasasi' => $data]);
    }

    public function get_kpi_summary()
    {
        $kode_satker = $this->input->get('kode_satker', true);
        $filter_tahun = $this->input->get('filter_tahun', true);

        // Jika MS Aceh (tingkat banding), gunakan KPI banding
        if ($kode_satker == '401582') {
            $data = $this->model->get_summary_perkara_banding($filter_tahun);

            header('Content-Type: application/json');
            echo json_encode([
                'perkara_diterima' => (int) $data->perkara_diterima,
                'perkara_diputus' => (int) $data->sudah_diputus,
                'sisa_perkara' => (int) $data->dalam_proses,
                'sisa_perkara_tahun_ini' => (int) $data->sisa_perkara_tahun_ini,
                'sisa_perkara_tahun_lalu' => (int) $data->sisa_perkara_tahun_lalu,
                'persentase_penyelesaian' => $data->perkara_diterima > 0
                    ? round(($data->sudah_diputus / $data->perkara_diterima) * 100, 2)
                    : 0
            ]);
        } else {
            // Untuk satker tingkat pertama
            $data = $this->model->get_kpi_summary($kode_satker, $filter_tahun);

            header('Content-Type: application/json');
            echo json_encode([
                'perkara_diterima' => (int) $data->perkara_diterima,
                'perkara_diputus' => (int) $data->perkara_diputus,
                'sisa_perkara' => (int) $data->sisa_perkara,
                'sisa_perkara_tahun_ini' => (int) $data->sisa_perkara_tahun_ini,
                'sisa_perkara_tahun_lalu' => (int) $data->sisa_perkara_tahun_lalu,
                'persentase_penyelesaian' => (float) $data->persentase_penyelesaian
            ]);
        }
    }

    // ============================================
    // NEW: Controller endpoints for new data
    // ============================================

    /**
     * Show Perkara Banding Table
     */
    public function show_perkara_banding()
    {
        $kode = $this->input->post('kode');
        $tgl_awal = $this->input->post('tgl_awal');
        $tgl_akhir = $this->input->post('tgl_akhir');

        $query = $this->model->get_perkara_banding($kode, $tgl_awal, $tgl_akhir);

        $data = [];
        foreach ($query as $row) {
            $data[] = [
                'nama_satker_asal' => $row->nama_satker_asal,
                'nomor_perkara_pertama' => $row->nomor_perkara_pertama,
                'nomor_perkara_banding' => $row->nomor_perkara_banding,
                'jenis_perkara_nama' => $row->jenis_perkara_nama,
                'tanggal_pendaftaran_banding' => $row->tanggal_pendaftaran_banding,
                'tahun_pendaftaran' => $row->tanggal_pendaftaran_banding ? date('Y', strtotime($row->tanggal_pendaftaran_banding)) : null,
                'tanggal_putusan_banding' => $row->tanggal_putusan_banding,
                'tahun_putusan' => $row->tanggal_putusan_banding ? date('Y', strtotime($row->tanggal_putusan_banding)) : null,
                'ketua_majelis' => $row->ketua_majelis,
                'status_proses' => $row->status_proses,
                'lama_proses_hari' => $row->lama_proses_hari
            ];
        }

        echo json_encode(['data_perkara_banding' => $data]);
    }

    /**
     * Get Statistik Kasasi Data
     */
    public function get_statistik_kasasi()
    {
        $kode_satker = $this->input->get('kode_satker', true);

        $data = $this->model->get_statistik_kasasi_chart($kode_satker);

        $categories = [];
        $permohonan = [];
        $dikabulkan = [];
        $dikuatkan = [];
        $ditolak = [];
        $dibatalkan = [];
        $diperbaiki = [];
        $tidak_diterima = [];
        $belum_putus = [];

        // Reverse untuk urutan kronologis (dari terlama ke terbaru)
        $data = array_reverse($data);

        foreach ($data as $row) {
            $categories[] = $row->periode_bulan;
            $permohonan[] = (int) $row->permohonan;
            $dikabulkan[] = (int) $row->dikabulkan;
            $dikuatkan[] = (int) $row->dikuatkan;
            $ditolak[] = (int) $row->ditolak;
            $dibatalkan[] = (int) $row->dibatalkan;
            $diperbaiki[] = (int) $row->diperbaiki;
            $tidak_diterima[] = (int) $row->tidak_diterima;
            $belum_putus[] = (int) $row->belum_putus;
        }

        header('Content-Type: application/json');
        echo json_encode([
            'categories' => $categories,
            'permohonan' => $permohonan,
            'dikabulkan' => $dikabulkan,
            'dikuatkan' => $dikuatkan,
            'ditolak' => $ditolak,
            'dibatalkan' => $dibatalkan,
            'diperbaiki' => $diperbaiki,
            'tidak_diterima' => $tidak_diterima,
            'belum_putus' => $belum_putus
        ]);
    }

    /**
     * Get Detail Perkara Kasasi (tabel per perkara)
     */
    public function get_detail_statistik_kasasi()
    {
        $kode_satker = $this->input->post('kode_satker', true);
        $periode_bulan = $this->input->post('periode_bulan', true);

        $data = $this->model->get_detail_perkara_kasasi($kode_satker, $periode_bulan);

        $result = [];
        foreach ($data as $row) {
            $result[] = [
                'nomor_perkara' => $row->nomor_perkara,
                'nomor_perkara_kasasi' => $row->nomor_perkara_kasasi,
                'nama_satker' => $row->nama_satker,
                'jenis_perkara' => $row->jenis_perkara,
                'tanggal_permohonan_kasasi' => $row->tanggal_permohonan_kasasi,
                'tahun_permohonan' => $row->tanggal_permohonan_kasasi ? date('Y', strtotime($row->tanggal_permohonan_kasasi)) : null,
                'tanggal_putusan_kasasi' => $row->tanggal_putusan_kasasi,
                'tahun_putusan' => $row->tanggal_putusan_kasasi ? date('Y', strtotime($row->tanggal_putusan_kasasi)) : null,
                'status_putusan_label' => $row->status_putusan_label,
                'nama_terdakwa' => $row->nama_terdakwa,
                'usia' => $row->usia,
                'lama_proses_hari' => $row->lama_proses_hari
            ];
        }

        header('Content-Type: application/json');
        echo json_encode(['data_detail_kasasi' => $result]);
    }

    /**
     * Get Ringkasan Perkara Banding Per Satker
     */
    public function get_ringkasan_perkara_banding_per_satker()
    {
        $data = $this->model->get_ringkasan_perkara_banding_per_satker();

        header('Content-Type: application/json');
        echo json_encode($data);
    }

    /**
     * Get Detail Perkara Banding by Satker Asal
     */
    public function get_detail_perkara_banding_by_satker()
    {
        $kode_satker_asal = $this->input->post('kode_satker_asal', true);

        $data = $this->model->get_detail_perkara_banding_by_satker($kode_satker_asal);

        $result = [];
        foreach ($data as $row) {
            $result[] = [
                'nomor_perkara_pertama' => $row->nomor_perkara_pertama,
                'nomor_perkara_banding' => $row->nomor_perkara_banding,
                'nama_satker_asal' => $row->nama_satker_asal,
                'jenis_perkara_nama' => $row->jenis_perkara_nama,
                'tanggal_pendaftaran_banding' => $row->tanggal_pendaftaran_banding,
                'tahun_pendaftaran' => $row->tahun_pendaftaran,
                'tanggal_putusan_banding' => $row->tanggal_putusan_banding,
                'tahun_putusan' => $row->tahun_putusan,
                'ketua_majelis' => $row->ketua_majelis,
                'status_proses' => $row->status_proses,
                'lama_proses_hari' => $row->lama_proses_hari
            ];
        }

        header('Content-Type: application/json');
        echo json_encode(['data_perkara_banding' => $result]);
    }

    /**
     * Get Status Sinkronisasi
     */
    public function get_sinkronisasi_status()
    {
        $data = $this->model->get_sinkronisasi_status();

        $result = [];
        foreach ($data as $row) {
            $result[] = [
                'kode_satker' => $row->kode_satker,
                'nama_satker' => $row->nama_satker,
                'kota' => $row->kota,
                'status_sinkronisasi' => $row->status_sinkronisasi,
                'selisih_hari' => $row->selisih_hari,
                'last_sync' => $row->last_sync
            ];
        }

        header('Content-Type: application/json');
        echo json_encode($result);
    }

    /**
     * Get Summary Perkara Banding
     */
    public function get_summary_perkara_banding()
    {
        $data = $this->model->get_summary_perkara_banding();

        header('Content-Type: application/json');
        echo json_encode([
            'total_perkara_banding' => (int) $data->total_perkara_banding,
            'sudah_diputus' => (int) $data->sudah_diputus,
            'dalam_proses' => (int) $data->dalam_proses,
            'rata_rata_lama_proses' => (int) $data->rata_rata_lama_proses
        ]);
    }

    /**
     * Get Ringkasan Kasasi Per Satker (untuk MS Aceh)
     */
    public function get_ringkasan_kasasi_per_satker()
    {
        $data = $this->model->get_ringkasan_kasasi_per_satker();

        $result = [];
        foreach ($data as $row) {
            $result[] = [
                'kode_satker' => $row->kode_satker,
                'nama_satker' => $row->nama_satker,
                'total_permohonan' => (int) $row->total_permohonan,
                'dikabulkan' => (int) $row->dikabulkan,
                'ditolak' => (int) $row->ditolak,
                'dibatalkan' => (int) $row->dibatalkan,
                'tidak_diterima' => (int) $row->tidak_diterima,
                'belum_putus' => (int) $row->belum_putus,
                'sudah_diputus' => (int) $row->sudah_diputus
            ];
        }

        header('Content-Type: application/json');
        echo json_encode($result);
    }
}
