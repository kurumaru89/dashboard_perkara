<?php

class HalamanSakip extends CI_Controller
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
        $this->load->view('sakip', $data);
    }

    public function get_chart_perdata_tepat_waktu()
    {
        $kode = $this->input->post('kode_satker', true);
        $tahun = $this->input->post('tahun');

        $data = $this->model->get_chart_perdata_tepat_waktu($kode, $tahun);

        echo json_encode($data);
    }

    public function get_tabel_perdata_tepat()
    {
        $kode_satker = $this->input->post('kode_satker');
        $tahun = $this->input->post('tahun');

        $perkara_putus = $this->model->get_tabel_perdata_tepat_waktu($kode_satker, $tahun);

        $data = [];
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
        foreach ($perkara_putus as $row) {
            $data[] = [
                'bulan' => $nama_bulan[(int)$row->bulan],
                'diputus_sd_3_bulan' => $row->diputus_sd_3_bulan,
                'diputus_3_sd_5_bulan' => $row->diputus_3_sd_5_bulan,
                'diputus_lebih_5_bulan' => $row->diputus_lebih_5_bulan,
                'jumlah_tepat_waktu' => $row->jumlah_tepat_waktu,
                'jumlah_perkara_putus' => $row->jumlah_perkara_putus
            ];
        }

        echo json_encode(['data' => $data]);
    }

    public function get_chart_perkara_ecourt()
    {
        $kode = $this->input->post('kode_satker', true);
        $tahun = $this->input->post('tahun');

        $data = $this->model->get_chart_perkara_ecourt($kode, $tahun);

        echo json_encode($data);
    }

    public function get_tabel_perkara_ecourt()
    {
        $kode_satker = $this->input->post('kode_satker');
        $tahun = $this->input->post('tahun');

        $perkara_ecourt = $this->model->get_tabel_perkara_ecourt($kode_satker, $tahun);
        
        $data = [];
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
        foreach ($perkara_ecourt as $row) {
            $data[] = [
                'bulan' => $nama_bulan[(int)$row->bulan],
                'jumlah_perkara_ecourt' => $row->jumlah_perkara_ecourt,
                'jumlah_perkara_non_ecourt' => $row->jumlah_perkara_non_ecourt,
                'jumlah_perkara_masuk' => $row->jumlah_perkara_masuk
            ];
        }

        echo json_encode(['data' => $data]);
    }

    public function get_chart_perkara_eberpadu()
    {
        $kode = $this->input->post('kode_satker', true);
        $tahun = $this->input->post('tahun');

        $data = $this->model->get_chart_perkara_eberpadu($kode, $tahun);

        echo json_encode($data);
    }

    public function get_tabel_perkara_eberpadu()
    {
        $kode_satker = $this->input->post('kode_satker');
        $tahun = $this->input->post('tahun');

        $perkara_ecourt = $this->model->get_tabel_perkara_eberpadu($kode_satker, $tahun);
        
        $data = [];
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
        foreach ($perkara_ecourt as $row) {
            $data[] = [
                'bulan' => $nama_bulan[(int)$row->bulan],
                'jumlah_perkara_eberpadu' => $row->jumlah_perkara_eberpadu,
                'jumlah_perkara_non_eberpadu' => $row->jumlah_perkara_non_eberpadu,
                'jumlah_perkara_masuk' => $row->jumlah_perkara_masuk
            ];
        }

        echo json_encode(['data' => $data]);
    }

    public function get_chart_jinayat_tepat_waktu()
    {
        $kode = $this->input->post('kode_satker', true);
        $tahun = $this->input->post('tahun');

        $data = $this->model->get_chart_jinayat_tepat_waktu($kode, $tahun);

        echo json_encode($data);
    }

    public function get_tabel_jinayat_tepat()
    {
        $kode_satker = $this->input->post('kode_satker');
        $tahun = $this->input->post('tahun');

        $perkara_putus = $this->model->get_tabel_jinayat_tepat_waktu($kode_satker, $tahun);

        $data = [];
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
        foreach ($perkara_putus as $row) {
            $data[] = [
                'bulan' => $nama_bulan[(int)$row->bulan],
                'diputus_sd_3_bulan' => $row->diputus_sd_3_bulan,
                'diputus_3_sd_5_bulan' => $row->diputus_3_sd_5_bulan,
                'diputus_lebih_5_bulan' => $row->diputus_lebih_5_bulan,
                'jumlah_tepat_waktu' => $row->jumlah_tepat_waktu,
                'jumlah_perkara_putus' => $row->jumlah_perkara_putus
            ];
        }

        echo json_encode(['data' => $data]);
    }

    public function get_tabel_prodeo()
    {
        $kode_satker = $this->input->post('kode_satker');
        $tahun = $this->input->post('tahun');

        $perkara_prodeo = $this->model->get_tabel_prodeo($kode_satker, $tahun);
        $data = [];
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
        foreach ($perkara_prodeo as $row) {
            $data[] = [
                'bulan' => $nama_bulan[(int)$row->bulan],
                'prodeo_diterima' => $row->prodeo_diterima,
                'prodeo_diputus' => $row->prodeo_diputus
            ];
        }

        echo json_encode(['data' => $data]);
    }
}