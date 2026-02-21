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
                $where = [
                    'DATE(permohonan_eksekusi) >=' => $tgl_awal,
                    'DATE(permohonan_eksekusi) <=' => $tgl_akhir
                ];
            }

            $query = $this->model->get_seleksi_array('fact_eksekusi', $where, ['permohonan_eksekusi' => 'DESC'])->result();
        } else {
            if (!empty($tgl_awal) && !empty($tgl_akhir)) {
                $where = [
                    'kode_satker' => $kode,
                    'DATE(permohonan_eksekusi) >=' => $tgl_awal,
                    'DATE(permohonan_eksekusi) <=' => $tgl_akhir
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
        $kode = $this->input->post('kode');
        $tgl_awal = $this->input->post('tgl_awal');
        $tgl_akhir = $this->input->post('tgl_akhir');

        $where = [];
        if ($kode == '401582') {
            if (!empty($tgl_awal) && !empty($tgl_akhir)) {
                $where = [
                    'DATE(tanggal_pendaftaran) >=' => $tgl_awal,
                    'DATE(tanggal_pendaftaran) <=' => $tgl_akhir
                ];
            }

            $query = $this->model->get_seleksi_array('v_perkara_jinayat', $where, ['tanggal_pendaftaran' => 'DESC'])->result();
        } else {
            if (!empty($tgl_awal) && !empty($tgl_akhir)) {
                $where = [
                    'kode_satker' => $kode,
                    'DATE(tanggal_pendaftaran) >=' => $tgl_awal,
                    'DATE(tanggal_pendaftaran) <=' => $tgl_akhir
                ];
            } else
                $where = ['kode_satker' => $kode];

            $query = $this->model->get_seleksi_array('v_perkara_jinayat', $where, ['tanggal_pendaftaran' => 'DESC'])->result();
        }

        $data = [];

        foreach ($query as $row) {
            $data[] = [
                'nama_satker' => $row->nama_satker,
                'nomor_perkara' => $row->nomor_perkara,
                'jenis_perkara' => $row->jenis_perkara,
                'tanggal_pendaftaran' => $row->tanggal_pendaftaran,
                'tanggal_putusan' => $row->tanggal_putusan,
                'jenis_hukuman' => $row->jenis_hukuman,
                'nama_terdakwa' => $row->nama_terdakwa,
                'usia' => $row->usia
            ];
        }

        echo json_encode(['data_jinayat' => $data]);
    }

    public function get_chart_jinayat()
    {
        $kode = $this->input->get('kode_satker', true);
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
                $where = [
                    'DATE(tanggal_pendaftaran) >=' => $tgl_awal,
                    'DATE(tanggal_pendaftaran) <=' => $tgl_akhir
                ];
            }

            $query = $this->model->get_seleksi_array('v_perkara_jinayat_kasasi', $where, ['tanggal_permohonan_kasasi' => 'DESC'])->result();
        } else {
            if (!empty($tgl_awal) && !empty($tgl_akhir)) {
                $where = [
                    'kode_satker' => $kode,
                    'DATE(tanggal_permohonan_kasasi) >=' => $tgl_awal,
                    'DATE(tanggal_permohonan_kasasi) <=' => $tgl_akhir
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