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

            $this->db->limit(1000); // atau jumlah yang wajar
            
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

    public function get_kpi_summary($kode_satker = null, $filter_tahun = null)
    {
        // Tentukan tahun berdasarkan filter atau tahun berjalan
        $tahun_filter = (!empty($filter_tahun)) ? $filter_tahun : date('Y');

        $this->db->select("
            COALESCE(SUM(CASE
                WHEN YEAR(tanggal_pendaftaran) = '{$tahun_filter}'
                THEN 1 ELSE 0
            END), 0) AS perkara_diterima,

            COALESCE(SUM(CASE
                WHEN YEAR(tanggal_putusan) = '{$tahun_filter}'
                THEN 1 ELSE 0
            END), 0) AS perkara_diputus,

            COALESCE(SUM(CASE
                WHEN YEAR(tanggal_pendaftaran) = '{$tahun_filter}'
                    AND tanggal_putusan IS NULL
                THEN 1 ELSE 0
            END), 0) AS sisa_perkara_tahun_ini,

            COALESCE(SUM(CASE
                WHEN YEAR(tanggal_pendaftaran) < '{$tahun_filter}'
                    AND tanggal_putusan IS NULL
                THEN 1 ELSE 0
            END), 0) AS sisa_perkara_tahun_lalu
        ", false);

        $this->db->from('fact_perkara');

        // Filter satker
        if ($kode_satker === 'all-pertama') {
            // Semua satker tingkat pertama (kecuali MS Aceh)
            $this->db->where('kode_satker <>', '401582');
        } elseif (!empty($kode_satker) && $kode_satker != '401582') {
            // Satker spesifik (tingkat pertama)
            $this->db->where('kode_satker', $kode_satker);
        } elseif ($kode_satker == '401582') {
            // MS Aceh (tingkat banding)
            $this->db->where('kode_satker', '401582');
        } else {
            // Default: semua satker tingkat pertama
            $this->db->where('kode_satker <>', '401582');
        }

        $result = $this->db->get()->row();

        // Calculate total sisa perkara
        $result->sisa_perkara = $result->sisa_perkara_tahun_ini + $result->sisa_perkara_tahun_lalu;

        // Calculate percentage
        $result->persentase_penyelesaian = $result->perkara_diterima > 0
            ? round(($result->perkara_diputus / $result->perkara_diterima) * 100, 2)
            : 0;

        return $result;
    }

    // ============================================
    // NEW: Model methods for new tables
    // ============================================

    /**
     * Get Perkara Banding data
     */
    public function get_perkara_banding($kode_satker = null, $tgl_awal = null, $tgl_akhir = null)
    {
        $this->db->from('fact_perkara_banding');

        // Filter satker
        if (!empty($kode_satker) && $kode_satker != '401582') {
            $this->db->where('kode_satker_asal', $kode_satker);
        }

        // Filter tanggal
        if (!empty($tgl_awal) && !empty($tgl_akhir)) {
            $this->db->where('tanggal_pendaftaran_banding >=', $tgl_awal);
            $this->db->where('tanggal_pendaftaran_banding <=', $tgl_akhir);
        }

        $this->db->order_by('tanggal_pendaftaran_banding', 'DESC');
        $this->db->limit(1000);

        return $this->db->get()->result();
    }

    /**
     * Get Statistik Kasasi per satker
     */
    public function get_statistik_kasasi($kode_satker = null, $periode_bulan = null)
    {
        $this->db->from('fact_statistik_kasasi');

        // Filter satker
        if (!empty($kode_satker) && $kode_satker != '401582') {
            $this->db->where('kode_satker', $kode_satker);
        }

        // Filter periode
        if (!empty($periode_bulan)) {
            $this->db->where('periode_bulan', $periode_bulan);
        }

        $this->db->order_by('periode_bulan', 'DESC');
        $this->db->limit(100);

        return $this->db->get()->result();
    }

    /**
     * Get Statistik Kasasi Summary untuk Chart
     */
    public function get_statistik_kasasi_chart($kode_satker = null)
    {
        $this->db->select("
            periode_bulan,
            SUM(total_permohonan_kasasi) AS permohonan,
            SUM(total_dikabulkan) AS dikabulkan,
            SUM(total_dikuatkan) AS dikuatkan,
            SUM(total_ditolak) AS ditolak,
            SUM(total_dibatalkan) AS dibatalkan,
            SUM(total_diperbaiki) AS diperbaiki,
            SUM(total_tidak_diterima) AS tidak_diterima,
            SUM(total_belum_putus) AS belum_putus
        ", false);

        $this->db->from('fact_statistik_kasasi');

        // Filter satker
        if (!empty($kode_satker) && $kode_satker != '401582') {
            $this->db->where('kode_satker', $kode_satker);
        }

        $this->db->group_by('periode_bulan');
        $this->db->order_by('periode_bulan', 'DESC');

        return $this->db->get()->result();
    }

    /**
     * Get Status Sinkronisasi semua satker (dari dim_satker.updated_at)
     */
    public function get_sinkronisasi_status()
    {
        $this->db->select("
            kode_satker,
            nama_satker,
            kota,
            updated_at AS last_sync,
            DATEDIFF(CURDATE(), updated_at) AS selisih_hari,
            CASE
                WHEN DATEDIFF(CURDATE(), updated_at) <= 1 THEN 'Aktif'
                WHEN DATEDIFF(CURDATE(), updated_at) BETWEEN 2 AND 7 THEN 'Lama'
                ELSE 'Offline'
            END AS status_sinkronisasi
        ", false);

        $this->db->from('dim_satker');
        $this->db->order_by('selisih_hari', 'ASC');

        return $this->db->get()->result();
    }

    /**
     * Get Summary Perkara Banding untuk KPI
     */
    public function get_summary_perkara_banding($filter_tahun = null)
    {
        // Tentukan tahun berdasarkan filter atau tahun berjalan
        $tahun_filter = (!empty($filter_tahun)) ? $filter_tahun : date('Y');

        $this->db->select("
            COUNT(*) AS total_perkara_banding,
            SUM(CASE WHEN YEAR(tanggal_pendaftaran_banding) = '{$tahun_filter}' THEN 1 ELSE 0 END) AS perkara_diterima,
            SUM(CASE WHEN YEAR(tanggal_putusan_banding) = '{$tahun_filter}' THEN 1 ELSE 0 END) AS sudah_diputus,
            SUM(CASE WHEN tanggal_putusan_banding IS NULL THEN 1 ELSE 0 END) AS dalam_proses,
            SUM(CASE
                WHEN YEAR(tanggal_pendaftaran_banding) = '{$tahun_filter}'
                    AND tanggal_putusan_banding IS NULL
                THEN 1 ELSE 0
            END) AS sisa_perkara_tahun_ini,
            SUM(CASE
                WHEN YEAR(tanggal_pendaftaran_banding) < '{$tahun_filter}'
                    AND tanggal_putusan_banding IS NULL
                THEN 1 ELSE 0
            END) AS sisa_perkara_tahun_lalu,
            AVG(lama_proses_hari) AS rata_rata_lama_proses
        ", false);

        $this->db->from('fact_perkara_banding');

        return $this->db->get()->row();
    }

    /**
     * Get Summary Statistik Kasasi untuk KPI
     */
    public function get_summary_statistik_kasasi($kode_satker = null)
    {
        $this->db->select("
            SUM(total_permohonan_kasasi) AS total_permohonan,
            SUM(total_dikabulkan) AS total_dikabulkan,
            SUM(total_ditolak) AS total_ditolak,
            SUM(total_lainnya) AS total_lainnya
        ", false);

        $this->db->from('fact_statistik_kasasi');

        if (!empty($kode_satker) && $kode_satker != '401582') {
            $this->db->where('kode_satker', $kode_satker);
        }

        return $this->db->get()->row();
    }

    /**
     * Get Ringkasan Kasasi Per Satker (untuk MS Aceh/Banding)
     */
    public function get_ringkasan_kasasi_per_satker()
    {
        $this->db->select("
            s.kode_satker,
            s.nama_satker,
            COALESCE(SUM(k.total_permohonan_kasasi), 0) AS total_permohonan,
            COALESCE(SUM(k.total_dikabulkan), 0) AS dikabulkan,
            COALESCE(SUM(k.total_dikuatkan), 0) AS dikuatkan,
            COALESCE(SUM(k.total_ditolak), 0) AS ditolak,
            COALESCE(SUM(k.total_dibatalkan), 0) AS dibatalkan,
            COALESCE(SUM(k.total_diperbaiki), 0) AS diperbaiki,
            COALESCE(SUM(k.total_tidak_diterima), 0) AS tidak_diterima,
            COALESCE(SUM(k.total_sudah_putus), 0) AS sudah_diputus,
            COALESCE(SUM(k.total_belum_putus), 0) AS belum_putus
        ", false);

        $this->db->from('dim_satker s');
        $this->db->join('fact_statistik_kasasi k', 'k.kode_satker = s.kode_satker', 'left');
        $this->db->where('s.kode_satker <>', '401582'); // Exclude MS Aceh
        $this->db->where('(k.total_permohonan_kasasi > 0 OR k.total_permohonan_kasasi IS NOT NULL)', NULL, false);
        $this->db->group_by(['s.kode_satker', 's.nama_satker']);
        $this->db->order_by('total_permohonan', 'DESC');

        return $this->db->get()->result();
    }

    /**
     * Get Ringkasan Perkara Banding Per Satker (untuk MS Aceh/Banding)
     */
    public function get_ringkasan_perkara_banding_per_satker()
    {
        $this->db->select("
            kode_satker_asal,
            nama_satker_asal,
            COUNT(*) AS total_perkara_banding,
            SUM(CASE WHEN status_proses = 'Diputus' THEN 1 ELSE 0 END) AS sudah_diputus,
            SUM(CASE WHEN status_proses = 'Dalam Proses' THEN 1 ELSE 0 END) AS dalam_proses,
            SUM(CASE WHEN status_proses = 'Dicabut' THEN 1 ELSE 0 END) AS dicabut,
            COALESCE(AVG(lama_proses_hari), 0) AS rata_rata_lama_proses
        ", false);

        $this->db->from('fact_perkara_banding');
        $this->db->group_by(['kode_satker_asal', 'nama_satker_asal']);
        $this->db->order_by('total_perkara_banding', 'DESC');

        return $this->db->get()->result();
    }

    /**
     * Get Detail Perkara Banding per Satker Asal
     */
    public function get_detail_perkara_banding_by_satker($kode_satker_asal = null)
    {
        $this->db->select("
            nomor_perkara_pertama,
            nomor_perkara_banding,
            nama_satker_asal,
            jenis_perkara_nama,
            tanggal_pendaftaran_banding,
            YEAR(tanggal_pendaftaran_banding) AS tahun_pendaftaran,
            tanggal_putusan_banding,
            YEAR(tanggal_putusan_banding) AS tahun_putusan,
            ketua_majelis,
            status_proses,
            lama_proses_hari
        ");

        $this->db->from('fact_perkara_banding');

        if (!empty($kode_satker_asal)) {
            $this->db->where('kode_satker_asal', $kode_satker_asal);
        }

        $this->db->order_by('tanggal_pendaftaran_banding', 'DESC');

        return $this->db->get()->result();
    }

    /**
     * Get Detail Perkara Kasasi (untuk tabel detail per perkara)
     * Mengambil data langsung dari database SIPP masing-masing satker
     */
    public function get_detail_perkara_kasasi($kode_satker = null, $periode_bulan = null)
    {
        // Dapatkan source_database untuk satker yang diminta
        $this->db->select('source_database, nama_satker');
        $this->db->from('dim_satker');
        $this->db->where('kode_satker', $kode_satker);
        $satker_info = $this->db->get()->row();

        if (!$satker_info || empty($satker_info->source_database)) {
            // Fallback ke tabel lama jika tidak ada source_database
            $this->db->select("
                pk.nomor_perkara,
                pk.nomor_perkara_kasasi,
                s.nama_satker,
                j.nama AS jenis_perkara,
                pk.tanggal_permohonan_kasasi,
                pk.tanggal_putusan_kasasi,
                CASE
                    WHEN pk.tanggal_putusan_kasasi IS NOT NULL THEN COALESCE(pk.status_putusan_kasasi, 'Diputus')
                    ELSE 'Belum Putus'
                END AS status_putusan_label,
                pk.nama_terdakwa,
                pk.usia,
                DATEDIFF(
                    COALESCE(pk.tanggal_putusan_kasasi, CURDATE()),
                    pk.tanggal_permohonan_kasasi
                ) AS lama_proses_hari
            ", false);

            $this->db->from('fact_perkara_jinayat_kasasi pk');
            $this->db->join('dim_satker s', 's.kode_satker = pk.kode_satker', 'left');
            $this->db->join('dim_jenis_perkara j', 'j.jenis_perkara_id = pk.jenis_perkara_id', 'left');
            $this->db->where('pk.kode_satker', $kode_satker);

            if (!empty($periode_bulan)) {
                $this->db->where('DATE_FORMAT(pk.tanggal_permohonan_kasasi, "%Y-%m")', $periode_bulan);
            }

            $this->db->order_by('pk.tanggal_permohonan_kasasi', 'DESC');
            $this->db->limit(1000);

            return $this->db->get()->result();
        }

        // Query langsung ke database SIPP satker yang bersangkutan
        $source_db = $satker_info->source_database;
        $nama_satker = $satker_info->nama_satker;

        // Escape database name for safety
        $source_db_escaped = $this->db->escape_str($source_db);
        $nama_satker_escaped = $this->db->escape_str($nama_satker);

        $sql = "
            SELECT
                pk.nomor_perkara_pn AS nomor_perkara,
                pk.nomor_perkara_kasasi,
                '$nama_satker_escaped' AS nama_satker,
                'Jinayat' AS jenis_perkara,
                pk.permohonan_kasasi AS tanggal_permohonan_kasasi,
                pk.putusan_kasasi AS tanggal_putusan_kasasi,
                CASE
                    WHEN pk.putusan_kasasi IS NOT NULL THEN
                        COALESCE(pk.status_putusan_kasasi_text, 'Diputus')
                    ELSE 'Belum Putus'
                END AS status_putusan_label,
                NULL AS nama_terdakwa,
                NULL AS usia,
                DATEDIFF(
                    COALESCE(pk.putusan_kasasi, CURDATE()),
                    pk.permohonan_kasasi
                ) AS lama_proses_hari
            FROM " . $source_db_escaped . ".perkara_kasasi pk
            WHERE pk.permohonan_kasasi IS NOT NULL
        ";

        // Filter periode (optional)
        if (!empty($periode_bulan)) {
            $sql .= " AND DATE_FORMAT(pk.permohonan_kasasi, '%Y-%m') = " . $this->db->escape($periode_bulan);
        }

        $sql .= " ORDER BY pk.permohonan_kasasi DESC LIMIT 1000";

        return $this->db->query($sql)->result();
    }
}