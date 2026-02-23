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

        $orderColumn = isset($columns[$orderColumnIndex])? $columns[$orderColumnIndex] : 'tanggal_pendaftaran';

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

        $data = $this->model->get_chart_jinayat($kode, $tgl_awal, $tgl_akhir);

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
}