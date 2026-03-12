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
        $data['tahun_perkara'] = $this->model->get_tahun();
        $this->load->view('dashboard', $data);
    }

    public function show_eksekusi()
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
            1 => 'nomor_perkara_pn',
            2 => 'nomor_register_eksekusi',
            3 => 'permohonan_eksekusi',
            4 => 'penetapan_teguran_eksekusi',
            5 => 'pelaksanaan_teguran_eksekusi',
            6 => 'penetapan_sita_eksekusi',
            7 => 'pelaksanaan_sita_eksekusi'
        ];

        $orderColumn = isset($columns[$orderColumnIndex]) ? $columns[$orderColumnIndex] : 'permohonan_eksekusi';

        // Base Query
        $this->db->from('fact_eksekusi');

        // FILTER KODE
        if ($kode !== '401582') {
            $this->db->where('kode_satker', $kode);
        }

        // FILTER TANGGAL (INDEX FRIENDLY)
        if (!empty($tgl_awal) && !empty($tgl_akhir)) {
            $this->db->where('permohonan_eksekusi >=', $tgl_awal);
            $this->db->where('permohonan_eksekusi <=', $tgl_akhir);
        }

        // SEARCH
        if (!empty($searchValue)) {
            $this->db->group_start();
            $this->db->like('nomor_perkara_pn', $searchValue);
            $this->db->or_like('nomor_register_eksekusi', $searchValue);
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
                $row->nomor_perkara_pn,
                $row->nomor_register_eksekusi,
                $row->permohonan_eksekusi,
                $row->penetapan_teguran_eksekusi,
                $row->pelaksanaan_teguran_eksekusi,
                $row->penetapan_sita_eksekusi,
                $row->pelaksanaan_sita_eksekusi
            ];
        }

        // TOTAL DATA TANPA FILTER
        $this->db->from('fact_eksekusi');
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

    public function show_eksekusi_ht()
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
            1 => 'eksekusi_nomor_perkara',
            2 => 'permohonan_eksekusi',
            3 => 'penetapan_teguran_eksekusi',
            4 => 'pelaksanaan_teguran_eksekusi',
            5 => 'penetapan_sita_eksekusi',
            6 => 'pelaksanaan_sita_eksekusi'
        ];

        $orderColumn = isset($columns[$orderColumnIndex]) ? $columns[$orderColumnIndex] : 'permohonan_eksekusi';

        // Base Query
        $this->db->from('fact_eksekusi_ht');

        // FILTER KODE
        if ($kode !== '401582') {
            $this->db->where('kode_satker', $kode);
        }

        // FILTER TANGGAL (INDEX FRIENDLY)
        if (!empty($tgl_awal) && !empty($tgl_akhir)) {
            $this->db->where('permohonan_eksekusi >=', $tgl_awal);
            $this->db->where('permohonan_eksekusi <=', $tgl_akhir);
        }

        // SEARCH
        if (!empty($searchValue)) {
            $this->db->group_start();
            $this->db->or_like('nomor_register_eksekusi', $searchValue);
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
                $row->eksekusi_nomor_perkara,
                $row->permohonan_eksekusi,
                $row->penetapan_teguran_eksekusi,
                $row->pelaksanaan_teguran_eksekusi,
                $row->penetapan_sita_eksekusi,
                $row->pelaksanaan_sita_eksekusi
            ];
        }

        // TOTAL DATA TANPA FILTER
        $this->db->from('fact_eksekusi_ht');
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
            4 => 'tanggal_putusan'
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
                $row->tanggal_putusan
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

    // ============================================
    // HAKIM WORKLOAD ENDPOINTS
    // ============================================

    /**
     * Get Hakim Workload Summary (KPI Cards)
     */
    public function get_hakim_workload_summary()
    {
        $kode_satker = $this->input->get('kode_satker', true);
        $filter_tahun = $this->input->get('filter_tahun', true);
        $tgl_awal = $this->input->get('tgl_awal', true);
        $tgl_akhir = $this->input->get('tgl_akhir', true);

        $data = $this->model->get_hakim_workload_summary($kode_satker, $filter_tahun, $tgl_awal, $tgl_akhir);

        header('Content-Type: application/json');
        echo json_encode([
            'total_hakim' => (int) $data->total_hakim,
            'total_perkara' => (int) $data->total_perkara,
            'avg_workload' => (int) $data->avg_workload,
            'max_workload' => (int) $data->max_workload,
            'min_workload' => (int) $data->min_workload,
            'total_diputus' => (int) $data->total_diputus,
            'total_aktif' => (int) $data->total_aktif,
            'avg_completion_rate' => (float) $data->avg_completion_rate
        ]);
    }

    /**
     * Get Hakim Workload List (for DataTable)
     */
    public function get_hakim_workload_list()
    {
        $kode_satker = $this->input->get('kode_satker', true);
        $filter_tahun = $this->input->get('filter_tahun', true);
        $tgl_awal = $this->input->get('tgl_awal', true);
        $tgl_akhir = $this->input->get('tgl_akhir', true);

        $data = $this->model->get_hakim_workload_list($kode_satker, null, $filter_tahun, $tgl_awal, $tgl_akhir);

        $result = [];
        foreach ($data as $row) {
            $result[] = [
                'hakim_id' => $row->hakim_id,
                'hakim_nama' => $row->hakim_nama,
                'hakim_nip' => $row->hakim_nip,
                'pangkat' => $row->pangkat,
                'jabatan' => $row->jabatan,
                'total_perkara' => (int) $row->total_perkara,
                'sebagai_ketua' => (int) $row->sebagai_ketua,
                'sebagai_anggota' => (int) $row->sebagai_anggota,
                'sebagai_tunggal' => (int) $row->sebagai_tunggal,
                'perkara_diputus' => (int) $row->perkara_diputus,
                'perkara_aktif' => (int) $row->perkara_aktif,
                'completion_rate' => (float) $row->completion_rate,
                'avg_hari_penyelesaian' => (int) $row->avg_hari_penyelesaian,
                'penetapan_pertama' => $row->penetapan_pertama,
                'penetapan_terakhir' => $row->penetapan_terakhir,
                'nama_satker' => $row->nama_satker
            ];
        }

        header('Content-Type: application/json');
        echo json_encode(['data' => $result]);
    }

    /**
     * Get Hakim Workload Distribution (for Pie Chart)
     */
    public function get_hakim_workload_distribution()
    {
        $kode_satker = $this->input->get('kode_satker', true);
        $filter_tahun = $this->input->get('filter_tahun', true);
        $tgl_awal = $this->input->get('tgl_awal', true);
        $tgl_akhir = $this->input->get('tgl_akhir', true);

        $data = $this->model->get_hakim_workload_list($kode_satker, null, $filter_tahun, $tgl_awal, $tgl_akhir);

        // Calculate distribution
        $distribution = [
            '0-100' => ['hakim' => 0, 'perkara' => 0],
            '100-299' => ['hakim' => 0, 'perkara' => 0],
            '300-499' => ['hakim' => 0, 'perkara' => 0],
            '500-799' => ['hakim' => 0, 'perkara' => 0],
            '800+' => ['hakim' => 0, 'perkara' => 0]
        ];

        foreach ($data as $row) {
            $total = $row->total_perkara;
            if ($total < 100) {
                $key = '0-100';
            } elseif ($total <= 299) {
                $key = '100-299';
            } elseif ($total <= 499) {
                $key = '300-499';
            } elseif ($total <= 799) {
                $key = '500-799';
            } else {
                $key = '800+';
            }

            $distribution[$key]['hakim']++;
            $distribution[$key]['perkara'] += $total;
        }

        $labels = [];
        $values = [];
        $counts = [];

        foreach ($distribution as $range => $stats) {
            $labels[] = $range . ' Perkara';
            $values[] = $stats['hakim'];
            $counts[] = $stats['perkara'];
        }

        header('Content-Type: application/json');
        echo json_encode([
            'labels' => $labels,
            'jumlah_hakim' => $values,
            'total_perkara' => $counts
        ]);
    }

    /**
     * Get Hakim Workload Top/Bottom (for Bar Chart)
     */
    public function get_hakim_workload_top()
    {
        $kode_satker = $this->input->get('kode_satker', true);
        $filter_tahun = $this->input->get('filter_tahun', true);
        $tgl_awal = $this->input->get('tgl_awal', true);
        $tgl_akhir = $this->input->get('tgl_akhir', true);

        $data = $this->model->get_hakim_workload_list($kode_satker, 15, $filter_tahun, $tgl_awal, $tgl_akhir);

        $top_hakim = [];
        foreach ($data as $row) {
            $top_hakim[] = [
                'nama' => strlen($row->hakim_nama) > 20 ? substr($row->hakim_nama, 0, 20) . '...' : $row->hakim_nama,
                'nama_full' => $row->hakim_nama,
                'total_perkara' => (int) $row->total_perkara,
                'sebagai_ketua' => (int) $row->sebagai_ketua,
                'sebagai_anggota' => (int) $row->sebagai_anggota
            ];
        }

        header('Content-Type: application/json');
        echo json_encode($top_hakim);
    }

    /**
     * Get Hakim Workload Trend (for Line Chart)
     */
    public function get_hakim_workload_trend()
    {
        $kode_satker = $this->input->get('kode_satker', true);
        $data = $this->model->get_hakim_workload_trend($kode_satker);

        $periode = [];
        $total_perkara = [];
        $jumlah_hakim = [];
        $avg_per_hakim = [];

        // Reverse to get chronological order
        $data = array_reverse($data);

        foreach ($data as $row) {
            $periode[] = $row->periode_bulan;
            $total_perkara[] = (int) $row->total_perkara;
            $jumlah_hakim[] = (int) $row->jumlah_hakim;
            $avg_per_hakim[] = (int) $row->avg_per_hakim;
        }

        header('Content-Type: application/json');
        echo json_encode([
            'periode' => $periode,
            'total_perkara' => $total_perkara,
            'jumlah_hakim' => $jumlah_hakim,
            'avg_per_hakim' => $avg_per_hakim
        ]);
    }

    public function get_tabel_faktor_perceraian()
    {
        $kode_satker = $this->input->post('kode_satker');
        $tahun = $this->input->post('tahun');

        $faktor_cerai = $this->model->get_tabel_faktor_perceraian($kode_satker, $tahun);

        echo json_encode(['data' => $faktor_cerai]);
    }

    public function get_tabel_faktor_perceraian_satker()
    {
        $kode_satker = $this->input->post('kode_satker');
        $tahun = $this->input->post('tahun');

        $faktor_cerai = $this->model->get_tabel_faktor_perceraian_satker($kode_satker, $tahun);

        $nama_bulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember'
        ];

        foreach ($faktor_cerai as $row) {
            $row->bulan = $nama_bulan[(int)$row->bulan];
        }

        echo json_encode(['data' => $faktor_cerai]);
    }

    public function get_tabel_perkara_terima()
    {
        $kode_satker = $this->input->post('kode_satker');
        $tahun = $this->input->post('tahun');

        $perkara_terima = $this->model->get_tabel_perkara_terima($kode_satker, $tahun);

        echo json_encode(['data' => $perkara_terima]);
    }

    public function get_tabel_perkara_terima_satker()
    {
        $kode_satker = $this->input->post('kode_satker');
        $tahun = $this->input->post('tahun');

        $perkara_terima = $this->model->get_tabel_perkara_terima_satker($kode_satker, $tahun);

        $nama_bulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember'
        ];

        foreach ($perkara_terima as $row) {
            $row->bulan = $nama_bulan[(int)$row->bulan];
        }

        echo json_encode(['data' => $perkara_terima]);
    }
}
