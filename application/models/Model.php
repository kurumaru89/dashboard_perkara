<?php

class Model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    public function get_seleksi_array($tabel, $where = [], $order_by = [])
    {
        try {
            // multiple where
            if (!empty($where)) {
                foreach ($where as $kolom => $nilai) {
                    $this->db->where($kolom, $nilai);
                }
            }

            // multiple order by
            if (!empty($order_by)) {
                foreach ($order_by as $kolom => $arah) {
                    $this->db->order_by($kolom, $arah); // ASC / DESC
                }
            }

            return $this->db->get($tabel);
        } catch (Exception $e) {
            return 0;
        }
    }

    public function get_chart_beban_perkara()
    {
        $this->db->select("
            s.kode_satker,
            s.nama_satker,

            COALESCE(SUM(
                CASE 
                    WHEN YEAR(f.tanggal_pendaftaran) = YEAR(CURDATE())
                    THEN 1 ELSE 0 
                END
            ),0) AS perkara_masuk_tahun_ini,

            COALESCE(SUM(
                CASE
                    WHEN YEAR(f.tanggal_pendaftaran) = YEAR(CURDATE()) - 1
                        AND (
                                f.tanggal_putusan IS NULL
                                OR YEAR(f.tanggal_putusan) = YEAR(CURDATE())
                            )
                    THEN 1 ELSE 0
                END
            ),0) AS sisa_perkara_tahun_lalu
        ", false);

        $this->db->from('dim_satker s');
        $this->db->join('fact_perkara f', 'f.kode_satker = s.kode_satker', 'left');
        $this->db->where('s.kode_satker <> 401582');
        $this->db->group_by(['s.kode_satker', 's.nama_satker']);
        $this->db->order_by('s.kode_satker', 'ASC');

        $query = $this->db->get()->result();

        $categories = [];
        $masuk = [];
        $sisa = [];

        foreach ($query as $row) {
            $categories[] = $row->nama_satker;
            $masuk[] = (int) $row->perkara_masuk_tahun_ini;
            $sisa[] = (int) $row->sisa_perkara_tahun_lalu;
        }

        return [
            'categories' => $categories,
            'perkara_masuk' => $masuk,
            'sisa_perkara' => $sisa
        ];
    }

    public function get_pie_beban_perkara($kode_satker = null)
    {
        $this->db->select("
            COALESCE(SUM(
                CASE 
                    WHEN YEAR(f.tanggal_pendaftaran) = YEAR(CURDATE())
                    THEN 1 ELSE 0 
                END
            ),0) AS perkara_masuk_tahun_ini,

            COALESCE(SUM(
                CASE
                    WHEN YEAR(f.tanggal_pendaftaran) = YEAR(CURDATE()) - 1
                         AND (
                                f.tanggal_putusan IS NULL
                                OR YEAR(f.tanggal_putusan) = YEAR(CURDATE())
                             )
                    THEN 1 ELSE 0
                END
            ),0) AS sisa_perkara_tahun_lalu
        ", false);

        $this->db->from('dim_satker s');
        $this->db->join('fact_perkara f', 'f.kode_satker = s.kode_satker', 'left');

        // filter satker (opsional)
        if (!empty($kode_satker) && $kode_satker != '401582') {
            $this->db->where('s.kode_satker', $kode_satker);
        }

        return $this->db->get()->row();
    }

    public function get_chart_jinayat($kode_satker, $tgl_awal = null, $tgl_akhir = null)
    {
        $this->db->select('
            r.jenis_perkara_id,
            r.nama,
            COUNT(j.jenis_perkara_id) AS jumlah
        ', false);

        $this->db->from('fact_perkara_jinayat j');
        $this->db->join(
            'dim_jenis_perkara r',
            'j.jenis_perkara_id = r.jenis_perkara_id',
            'right'
        );

        $this->db->where('r.jenis_perkara_id >=', 501);
        $this->db->where('r.jenis_perkara_id <=', 509);

        // filter satker (opsional)
        if (!empty($kode_satker) && $kode_satker != '401582') {
            $this->db->where('j.kode_satker', $kode_satker);
        }

        // filter tanggal (opsional)
        if (!empty($tgl_awal) && !empty($tgl_akhir)) {
            $this->db->where('j.tanggal_pendaftaran >=', $tgl_awal);
            $this->db->where('j.tanggal_pendaftaran <=', $tgl_akhir);
        }

        $this->db->group_by(['r.jenis_perkara_id', 'r.nama']);
        $this->db->order_by('r.jenis_perkara_id', 'ASC');

        return $this->db->get()->result();
    }
}