/**
 * MRTG Dashboard - Optimized JavaScript
 * Optimizations:
 * - Extracted duplicate helper functions
 * - Reusable DataTable configuration
 * - Cached jQuery selectors
 * - Throttled scroll handler
 * - Optimized header color switching
 */

(function ($) {
	"use strict";

	// ============================================
	// CACHED SELECTORS & CONSTANTS
	// ============================================
	const $window = $(window);
	const $html = $('html');
	const $wrapper = $('.wrapper');
	const $sidebarWrapper = $('.sidebar-wrapper');
	const $backToTop = $('.back-to-top');

	// Chart instances
	let pieChart = null;
	let chartJinayat = null;

	// Header color classes (untuk optimasi switching)
	const HEADER_COLORS = ['headercolor1', 'headercolor2', 'headercolor3', 'headercolor4',
		'headercolor5', 'headercolor6', 'headercolor7', 'headercolor8'];

	// ============================================
	// UTILITY FUNCTIONS
	// ============================================

	/**
	 * Throttle function untuk optimasi event handlers
	 */
	function throttle(func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	/**
	 * Format tanggal ke format Indonesia yang readable
	 */
	function formatTanggal(tgl) {
		if (!tgl || tgl === '0000-00-00') return null;
		const d = new Date(tgl);
		if (isNaN(d.getTime())) return tgl;
		return d.toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	/**
	 * Format tanggal untuk input (YYYY-MM-DD)
	 */
	function formatDate(date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	/**
	 * Render badge tahapan dengan tanggal
	 */
	function badgeTahapan(val) {
		if (!val || val === '0000-00-00') {
			return '<span class="badge bg-secondary bg-opacity-75">Belum Ada</span>';
		}
		const formatted = formatTanggal(val);
		return `<span class="badge bg-success bg-opacity-75">${formatted}</span>`;
	}

	/**
	 * Badge generator berdasarkan jenis hukuman
	 */
	function badgeHukuman(hukuman) {
		if (!hukuman) return '<span class="badge bg-secondary bg-opacity-75">Belum Putus</span>';
		const s = hukuman.toLowerCase();
		let badgeClass = 'bg-primary';
		if (s.includes('penjara') || s.includes('cambuk') || s.includes('kurungan')) {
			badgeClass = 'bg-danger';
		} else if (s.includes('bebas') || s.includes('lepas')) {
			badgeClass = 'bg-success';
		} else if (s.includes('denda') || s.includes('restitusi')) {
			badgeClass = 'bg-warning text-dark';
		}
		return `<span class="badge ${badgeClass}">${hukuman}</span>`;
	}

	/**
	 * Badge generator berdasarkan status putusan kasasi
	 */
	function badgePutusan(status) {
		if (!status) return '<span class="badge bg-secondary bg-opacity-75">Tidak Disebutkan</span>';
		const s = status.toLowerCase();
		let badgeClass = 'bg-primary';
		if (s.includes('tolak') || s.includes('batal') || s.includes('pidana')) {
			badgeClass = 'bg-danger';
		} else if (s.includes('kabul') || s.includes('bebas') || s.includes('lepas')) {
			badgeClass = 'bg-success';
		} else if (s.includes('tidak dapat diterima') || s.includes('no')) {
			badgeClass = 'bg-warning text-dark';
		}
		return `<span class="badge ${badgeClass}">${status}</span>`;
	}

	/**
	 * Generator warna stabil berdasarkan string
	 */
	function stringToColor(str) {
		let hash = 0;
		str = String(str);
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		let h = (hash * 137.508) % 360;
		if (h < 0) h += 360;
		let s = 60 + (hash % 20);
		let l = 45 + (hash % 15);
		return `hsl(${h}, ${s}%, ${l}%)`;
	}

	/**
	 * Reusable DataTable configuration
	 */
	function getDataTableConfig(options = {}) {
		const {
			order = [[0, 'desc']],
			pageLength = 10,
			columnDefs = [],
			buttons = [],
			onInitComplete = null
		} = options;

		return {
			order: order,
			pageLength: pageLength,
			lengthMenu: [
				[10, 25, 50, 100],
				['10 baris', '25 baris', '50 baris', '100 baris']
			],
			dom: "<'row mt-2'<'col-sm-12'B>>" +
				"<'row mb-3'" +
				"  <'col-sm-12 col-md-4'd>" +
				"  <'col-sm-12 col-md-4'l>" +
				"  <'col-sm-12 col-md-4'f>" +
				">" +
				"<'row'<'col-sm-12'tr>>" +
				"<'row mt-2'" +
				"  <'col-sm-12 col-md-5'i>" +
				"  <'col-sm-12 col-md-7'p>" +
				">",
			buttons: buttons.length > 0 ? buttons : [
				{
					extend: 'excelHtml5',
					text: '<i class="bx bx-spreadsheet me-1"></i> Export Excel',
					className: 'btn btn-sm btn-outline-success me-2',
					exportOptions: {
						columns: ':visible',
						format: {
							body: (data) => {
								const temp = document.createElement('div');
								temp.innerHTML = data;
								return temp.textContent || temp.innerText || '';
							}
						}
					}
				},
				{
					extend: 'colvis',
					text: '<i class="bx bx-columns me-1"></i> Kolom',
					className: 'btn btn-sm btn-outline-secondary'
				}
			],
			language: {
				search: '',
				searchPlaceholder: 'Cari perkara...',
				lengthMenu: 'Tampilkan _MENU_',
				info: 'Menampilkan _START_ - _END_ dari _TOTAL_ perkara',
				infoEmpty: 'Tidak ada data',
				infoFiltered: '(difilter dari _MAX_ total perkara)',
				zeroRecords: 'Tidak ditemukan perkara yang sesuai',
				paginate: {
					first: '<i class="bx bx-chevrons-left"></i>',
					last: '<i class="bx bx-chevrons-right"></i>',
					next: '<i class="bx bx-chevron-right"></i>',
					previous: '<i class="bx bx-chevron-left"></i>'
				}
			},
			columnDefs: columnDefs,
			drawCallback: function () {
				const api = this.api();
				api.column(0, { search: 'applied', order: 'applied', page: 'current' })
					.nodes()
					.each(function (cell, i) {
						cell.innerHTML = api.page.info().start + i + 1;
					});
			},
			initComplete: onInitComplete || function () { }
		};
	}

	/**
	 * Destroy DataTable dengan error handling
	 */
	function destroyDataTable(tableId) {
		if ($.fn.DataTable.isDataTable(tableId)) {
			try {
				$(tableId).DataTable().destroy();
			} catch (e) {
				console.warn('Error destroying DataTable:', e);
			}
		}
	}

	/**
	 * Render empty state message
	 */
	function renderEmptyState(message) {
		return `
			<div class="row">
				<div class="col">
					<div class="alert border-0 border-start border-5 border-info py-2">
						<div class="d-flex align-items-center">
							<div class="font-35 text-info"><i class="bx bx-info-square"></i></div>
							<div class="ms-3">
								<h6 class="mb-0 text-info">Informasi</h6>
								<div>${message}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	// ============================================
	// UI FUNCTIONS
	// ============================================

	function showLoading(message = "Memuat data dashboard...") {
		Swal.fire({
			title: message,
			html: 'Mohon tunggu...',
			allowOutsideClick: false,
			allowEscapeKey: false,
			showConfirmButton: false,
			didOpen: () => {
				Swal.showLoading();
			}
		});
	}

	function hideLoading() {
		Swal.close();
	}

	function notifikasi(pesan, result) {
		const iconMap = {
			'1': { type: 'success', icon: 'bx bx-check-circle' },
			'2': { type: 'warning', icon: 'bx bx-error' },
			'3': { type: 'error', icon: 'bx bx-x-circle' },
			'0': { type: 'info', icon: 'bx bx-info-circle' }
		};

		const config = iconMap[result] || iconMap['0'];

		Lobibox.notify(config.type, {
			pauseDelayOnHover: true,
			continueDelayOnInactiveTab: false,
			position: 'top right',
			icon: config.icon,
			sound: false,
			msg: pesan
		});
	}

	// ============================================
	// DASHBOARD FUNCTIONS
	// ============================================

	function getSatker(select) {
		const kode = select.value;
		const tingkat = select.options[select.selectedIndex].parentNode.getAttribute('label');

		// Tentukan mode berdasarkan pilihan
		if (kode === 'all-pertama' || tingkat === 'TINGKAT PERTAMA') {
			// Mode: Semua satker tingkat pertama atau satker pertama spesifik
			loadDashboardPerkara(kode);
		} else if (kode === '401582' || tingkat === 'TINGKAT BANDING') {
			// Mode: Tingkat banding
			loadDashboardPerkara(kode);
		} else {
			// Default: load dashboard dengan kode satker
			loadDashboardPerkara(kode);
		}
	}

	function setFilter() {
		const satker = document.getElementById('satker')?.value;
		if (satker) {
			loadDashboardPerkara(satker);
		}
	}

	// Initialize Flatpickr for date range filter
	function initDateRangePicker() {
		const tglFilter = document.getElementById('tgl_filter');
		if (tglFilter && !tglFilter._flatpickr) {
			flatpickr(tglFilter, {
				mode: 'range',
				dateFormat: 'd-m-Y',
				locale: {
					firstDayOfWeek: 1 // Monday first
				},
				onChange: function(selectedDates, dateStr, instance) {
					if (selectedDates.length === 2) {
						const startDate = formatDate(selectedDates[0]);
						const endDate = formatDate(selectedDates[1]);
						document.getElementById('tgl_awal').value = startDate;
						document.getElementById('tgl_akhir').value = endDate;
					}
				}
			});
		}
	}

	async function loadKpiSummary(kode_satker, filter_tahun = null) {
		return new Promise((resolve, reject) => {
			const data = { kode_satker: kode_satker };
			if (filter_tahun) {
				data.filter_tahun = filter_tahun;
			}

			const tahunDisplay = filter_tahun || new Date().getFullYear();

			$.ajax({
				url: 'halamanutama/get_kpi_summary',
				type: 'GET',
				data: data,
				dataType: 'json',
				beforeSend: function() {
					$('#kpiSummaryContainer').html(`
						<div class="row g-2">
							${[1,2,3,4,5].map(() => `
								<div class="col">
									<div class="card border-0 shadow-sm">
										<div class="card-body py-2">
											<div class="placeholder-glow">
												<span class="placeholder col-8 bg-secondary" style="height: 12px;"></span>
												<h5 class="placeholder col-12 bg-primary mt-1" style="height: 24px;"></h5>
											</div>
										</div>
									</div>
								</div>
							`).join('')}
						</div>
					`);
				}
			})
			.done(function(res) {
				// Dispose old tooltips before replacing content
				$('#kpiSummaryContainer [data-bs-toggle="tooltip"]').each(function() {
					const tooltip = bootstrap.Tooltip.getInstance(this);
					if (tooltip) {
						tooltip.dispose();
					}
				});

				$('#kpiSummaryContainer').html(`
					<div class="row g-2">
						<div class="col">
							<div class="card kpi-card border-0 shadow-sm border-start border-3 border-primary" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Perkara yang didaftarkan pada tahun berjalan">
								<div class="card-body py-2">
									<h6 class="text-muted text-uppercase mb-1" style="font-size: 11px;">Perkara Diterima</h6>
									<h5 class="mb-0 fw-bold text-primary">${res.perkara_diterima.toLocaleString('id-ID')}</h5>
									<small class="text-muted" style="font-size: 10px;">Tahun ${tahunDisplay}</small>
								</div>
							</div>
						</div>
						<div class="col">
							<div class="card kpi-card border-0 shadow-sm border-start border-3 border-success" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Perkara yang telah diputus pada tahun berjalan">
								<div class="card-body py-2">
									<h6 class="text-muted text-uppercase mb-1" style="font-size: 11px;">Perkara Diputus</h6>
									<h5 class="mb-0 fw-bold text-success">${res.perkara_diputus.toLocaleString('id-ID')}</h5>
									<small class="text-muted" style="font-size: 10px;">Tahun ${tahunDisplay}</small>
								</div>
							</div>
						</div>
						<div class="col">
							<div class="card kpi-card border-0 shadow-sm border-start border-3 border-warning" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Perkara tahun berjalan yang belum diputus">
								<div class="card-body py-2">
									<h6 class="text-muted text-uppercase mb-1" style="font-size: 11px;">Sisa Thn Ini</h6>
									<h5 class="mb-0 fw-bold text-warning">${res.sisa_perkara_tahun_ini?.toLocaleString('id-ID') || 0}</h5>
									<small class="text-muted" style="font-size: 10px;">Dalam proses</small>
								</div>
							</div>
						</div>
						<div class="col">
							<div class="card kpi-card border-0 shadow-sm border-start border-3 border-danger" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Perkara tahun sebelumnya yang belum diputus">
								<div class="card-body py-2">
									<h6 class="text-muted text-uppercase mb-1" style="font-size: 11px;">Sisa Thn Lalu</h6>
									<h5 class="mb-0 fw-bold text-danger">${res.sisa_perkara_tahun_lalu?.toLocaleString('id-ID') || 0}</h5>
									<small class="text-muted" style="font-size: 10px;">Dalam proses</small>
								</div>
							</div>
						</div>
						<div class="col">
							<div class="card kpi-card border-0 shadow-sm border-start border-3 border-info" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Persentase perkara yang diselesaikan dari total perkara diterima">
								<div class="card-body py-2">
									<h6 class="text-muted text-uppercase mb-1" style="font-size: 11px;">Penyelesaian</h6>
									<h5 class="mb-0 fw-bold text-info">${res.persentase_penyelesaian}%</h5>
									<div class="progress mt-1" style="height: 4px;">
										<div class="progress-bar bg-info" style="width: ${res.persentase_penyelesaian}%"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				`);

				// Initialize Bootstrap tooltips with proper configuration
				const tooltipTriggerList = $('#kpiSummaryContainer [data-bs-toggle="tooltip"]');
				tooltipTriggerList.each(function() {
					new bootstrap.Tooltip(this, {
						delay: { show: 300, hide: 100 },
						trigger: 'hover focus',
						boundary: 'viewport'
					});
				});

				resolve();
			})
			.fail(reject);
		});
	}

	async function loadDashboardPerkara(kode) {
		const tgl_awal = document.getElementById('tgl_awal')?.value || null;
		const tgl_akhir = document.getElementById('tgl_akhir')?.value || null;
		const filter_tahun = document.getElementById('filter_tahun')?.value || null;
		const useFilter = tgl_awal && tgl_akhir;
		const params = useFilter ? [kode, tgl_awal, tgl_akhir] : [kode];
		const isMsAceh = kode === '401582';

		showLoading("Menyiapkan dashboard...");

		// Tampilkan/Sembunyikan section Sinkronisasi
		if (isMsAceh) {
			$('#sectionSinkronisasi').show();
		} else {
			$('#sectionSinkronisasi').hide();
		}

		try {
			const requests = [
				loadKpiSummary(kode, filter_tahun),
				loadPiePerkara(kode),
				loadTabelEksekusi(...params),
				loadTabelEksekusiHT(...params),
				loadTabelPerkaraJinayat(...params),
				loadTabelPerkaraJinayatKasasi(...params),
				loadChartJinayat(...params),
				loadTabelPerkaraBanding(...params),
				loadChartStatistikKasasi(kode)
			];

			// Tambah loadTabelSinkronisasi hanya untuk MS Aceh
			if (isMsAceh) {
				requests.push(loadTabelSinkronisasi());
			}

			await Promise.all(requests);
			notifikasi("Menampilkan data satuan kerja", 1);
		} catch (err) {
			console.error("Dashboard Error:", err);
			notifikasi("Terjadi kesalahan saat memuat dashboard", 0);
		} finally {
			hideLoading();
		}
	}

	// ============================================
	// TABLE LOADING FUNCTIONS
	// ============================================

	function loadTabelEksekusi(kode, tgl_awal = null, tgl_akhir = null) {
		return new Promise((resolve, reject) => {
			const postData = { kode, ...(tgl_awal && tgl_akhir && { tgl_awal, tgl_akhir }) };
			destroyDataTable('#tabelEksekusiData');

			$.post('show_eksekusi', postData)
				.done(function (response) {
					try {
						const data = typeof response === 'string' ? JSON.parse(response) : response;
						const { data_eksekusi } = data;
						const $container = $('#tabelEksekusi').empty();

						if (!data_eksekusi?.length) {
							$container.html(renderEmptyState('Belum Ada Perkara Eksekusi, atau belum ada sinkronisasi ke satker daerah.'));
							resolve();
							return;
						}

						const rows = data_eksekusi.map((row, i) => `
							<tr>
								<td class="text-center align-middle">${i + 1}</td>
								<td class="align-middle"><small class="fw-semibold">${row.nama_satker ?? '-'}</small></td>
								<td class="align-middle"><span class="fw-semibold text-primary">${row.nomor_perkara_pn ?? '-'}</span></td>
								<td class="align-middle"><span class="fw-semibold text-primary">${row.nomor_register_eksekusi ?? '-'}</span></td>
								<td class="text-center align-middle" data-order="${row.permohonan_eksekusi}">${badgeTahapan(row.permohonan_eksekusi)}</td>
								<td class="text-center align-middle">${badgeTahapan(row.penetapan_teguran_eksekusi)}</td>
								<td class="text-center align-middle">${badgeTahapan(row.pelaksanaan_teguran_eksekusi)}</td>
								<td class="text-center align-middle">${badgeTahapan(row.penetapan_sita_eksekusi)}</td>
								<td class="text-center align-middle">${badgeTahapan(row.pelaksanaan_sita_eksekusi)}</td>
							</tr>
						`).join('');

						$container.html(`
							<div class="table-responsive">
								<table id="tabelEksekusiData" class="table table-striped table-bordered table-hover align-middle" style="width:100%">
									<thead class="table-dark">
										<tr>
											<th class="text-center" style="width:45px">No</th>
											<th>Nama Satker</th>
											<th>No. Perkara Perdata</th>
											<th>No. Perkara Eksekusi</th>
											<th class="text-center">Permohonan</th>
											<th class="text-center">Penetapan Teguran</th>
											<th class="text-center">Pelaksanaan Teguran</th>
											<th class="text-center">Penetapan Sita</th>
											<th class="text-center">Pelaksanaan Sita</th>
										</tr>
									</thead>
									<tbody>${rows}</tbody>
									<tfoot class="table-light">
										<tr>
											<th colspan="9" class="text-end pe-3">
												Total Perkara: <span class="badge bg-dark fs-6">${data_eksekusi.length}</span>
											</th>
										</tr>
									</tfoot>
								</table>
							</div>
						`);

						$('#tabelEksekusiData').DataTable(getDataTableConfig({
							order: [[4, 'desc']],
							columnDefs: [
								{ targets: 0, orderable: false, searchable: false, className: 'text-center' },
								{ targets: [4, 5, 6, 7, 8], className: 'text-center' }
							],
							buttons: [{
								extend: 'excelHtml5',
								text: '<i class="bx bx-spreadsheet me-1"></i> Export Excel',
								title: 'Data Eksekusi Perkara',
								className: 'btn btn-sm btn-outline-success me-2',
								exportOptions: {
									columns: ':visible',
									format: {
										body: (data) => {
											const temp = document.createElement('div');
											temp.innerHTML = data;
											return temp.textContent || temp.innerText || '';
										}
									}
								}
							}, {
								extend: 'colvis',
								text: '<i class="bx bx-columns me-1"></i> Kolom',
								className: 'btn btn-sm btn-outline-secondary'
							}],
							onInitComplete: resolve
						}));

					} catch (e) {
						console.error('Gagal parsing JSON:', e);
						$('#tabelEksekusi').html('<div class="alert alert-danger d-flex align-items-center" role="alert"><i class="bx bx-error-circle fs-4 me-2"></i><div>Gagal memuat data eksekusi. Silakan coba lagi.</div></div>');
						reject(e);
					}
				})
				.fail(reject);
		});
	}

	function loadTabelEksekusiHT(kode, tgl_awal = null, tgl_akhir = null) {
		return new Promise((resolve, reject) => {
			const postData = { kode, ...(tgl_awal && tgl_akhir && { tgl_awal, tgl_akhir }) };
			destroyDataTable('#tabelEksekusiHTData');

			$.post('show_eksekusi_ht', postData)
				.done(function (response) {
					try {
						const data = typeof response === 'string' ? JSON.parse(response) : response;
						const { data_eksekusi_ht } = data;
						const $container = $('#tabelEksekusiHT').empty();

						if (!data_eksekusi_ht?.length) {
							$container.html(renderEmptyState('Belum Ada Perkara Eksekusi HT, atau belum ada sinkronisasi ke satker daerah.'));
							resolve();
							return;
						}

						const rows = data_eksekusi_ht.map((row, i) => `
							<tr>
								<td class="text-center align-middle">${i + 1}</td>
								<td class="align-middle"><small class="fw-semibold">${row.nama_satker ?? '-'}</small></td>
								<td class="align-middle"><span class="fw-semibold text-primary">${row.nomor_register_eksekusi ?? '-'}</span></td>
								<td class="text-center align-middle" data-order="${row.permohonan_eksekusi}">${badgeTahapan(row.permohonan_eksekusi)}</td>
								<td class="text-center align-middle">${badgeTahapan(row.penetapan_teguran_eksekusi)}</td>
								<td class="text-center align-middle">${badgeTahapan(row.pelaksanaan_teguran_eksekusi)}</td>
								<td class="text-center align-middle">${badgeTahapan(row.penetapan_sita_eksekusi)}</td>
								<td class="text-center align-middle">${badgeTahapan(row.pelaksanaan_sita_eksekusi)}</td>
							</tr>
						`).join('');

						$container.html(`
							<div class="table-responsive">
								<table id="tabelEksekusiHTData" class="table table-striped table-bordered table-hover align-middle" style="width:100%">
									<thead class="table-dark">
										<tr>
											<th class="text-center" style="width:45px">No</th>
											<th>Nama Satker</th>
											<th>No. Perkara Eksekusi</th>
											<th class="text-center">Permohonan</th>
											<th class="text-center">Penetapan Teguran</th>
											<th class="text-center">Pelaksanaan Teguran</th>
											<th class="text-center">Penetapan Sita</th>
											<th class="text-center">Pelaksanaan Sita</th>
										</tr>
									</thead>
									<tbody>${rows}</tbody>
									<tfoot class="table-light">
										<tr>
											<th colspan="8" class="text-end pe-3">
												Total Perkara: <span class="badge bg-dark fs-6">${data_eksekusi_ht.length}</span>
											</th>
										</tr>
									</tfoot>
								</table>
							</div>
						`);

						$('#tabelEksekusiHTData').DataTable(getDataTableConfig({
							order: [[3, 'desc']],
							columnDefs: [
								{ targets: 0, orderable: false, searchable: false, className: 'text-center' },
								{ targets: [3, 4, 5, 6, 7], className: 'text-center' }
							],
							buttons: [{
								extend: 'excelHtml5',
								text: '<i class="bx bx-spreadsheet me-1"></i> Export Excel',
								title: 'Data Eksekusi Perkara Hak Tanggungan',
								className: 'btn btn-sm btn-outline-success me-2',
								exportOptions: {
									columns: ':visible',
									format: {
										body: (data) => {
											const temp = document.createElement('div');
											temp.innerHTML = data;
											return temp.textContent || temp.innerText || '';
										}
									}
								}
							}, {
								extend: 'colvis',
								text: '<i class="bx bx-columns me-1"></i> Kolom',
								className: 'btn btn-sm btn-outline-secondary'
							}],
							onInitComplete: resolve
						}));

					} catch (e) {
						console.error('Gagal parsing JSON:', e);
						$('#tabelEksekusiHT').html('<div class="alert alert-danger d-flex align-items-center" role="alert"><i class="bx bx-error-circle fs-4 me-2"></i><div>Gagal memuat data eksekusi. Silakan coba lagi.</div></div>');
						reject(e);
					}
				})
				.fail(reject);
		});
	}

	function loadTabelPerkaraJinayat(kode, tgl_awal = null, tgl_akhir = null) {
		return new Promise((resolve, reject) => {
			destroyDataTable('#tabelPerkaraJinayatData');

			$('#tabelPerkaraJinayat').html(`
				<div class="table-responsive">
					<table id="tabelPerkaraJinayatData" class="table table-striped table-bordered table-hover align-middle" width="100%">
						<thead class="table-dark">
							<tr>
								<th class="text-center" style="width:4%">No</th>
								<th>Nama Satker</th>
								<th>Nomor Perkara</th>
								<th>Jenis Jarimah</th>
								<th class="text-center">Tgl. Masuk Perkara</th>
								<th class="text-center">Tgl. Putus Perkara</th>
								<th>Jenis Hukuman</th>
								<th>Terdakwa</th>
								<th class="text-center">Usia</th>
							</tr>
						</thead>
						<tfoot class="table-light">
							<tr>
								<th colspan="9" class="text-end pe-3">
									Total Perkara :
									<span id="totalPerkaraBadge" class="badge bg-dark fs-6">0</span>
								</th>
							</tr>
						</tfoot>
					</table>
				</div>
			`);

			const table = $('#tabelPerkaraJinayatData').DataTable({
				processing: true,
				serverSide: true,
				destroy: true,
				responsive: false,
				scrollX: true,
				autoWidth: false,

				ajax: {
					url: 'show_jinayat',
					type: 'POST',
					data: function (d) {
						d.kode = kode;
						d.tgl_awal = tgl_awal;
						d.tgl_akhir = tgl_akhir;
					},
					dataSrc: function (json) {
						// Update badge saat data berhasil diambil
						updateTotalBadge(json.recordsFiltered || json.recordsTotal || 0);
						return json.data;
					},
					error: function (xhr) {
						reject(xhr);
					}
				},

				order: [[4, 'desc']],

				columns: [
					{ data: 0, className: 'text-center align-middle', orderable: false, searchable: false },
					{ data: 1 },
					{ data: 2 },
					{ data: 3 },
					{ data: 4, className: 'text-center align-middle' },
					{ data: 5, className: 'text-center align-middle' },
					{ data: 6 },
					{ data: 7 },
					{ data: 8, className: 'text-center' }
				],

				dom: 'Bfrtip',

				buttons: [
					{
						extend: 'excelHtml5',
						text: '<i class="bx bx-spreadsheet me-1"></i> Export Excel',
						title: 'Data Perkara Jinayat',
						className: 'btn btn-sm btn-outline-success me-2'
					},
					{
						extend: 'colvis',
						text: '<i class="bx bx-columns me-1"></i> Kolom',
						className: 'btn btn-sm btn-outline-secondary'
					}
				],

				// Gunakan drawCallback untuk update setiap kali tabel di-render
				drawCallback: function (settings) {
					const json = settings.json;
					if (json) {
						updateTotalBadge(json.recordsFiltered || 0);
					}
					resolve();
				}
			});

			// Fungsi helper untuk update badge
			function updateTotalBadge(total) {
				$('#totalPerkaraBadge').text(total.toLocaleString('id-ID'));
			}

			// Fallback: Update badge setelah ajax complete
			$('#tabelPerkaraJinayatData').on('xhr.dt', function (e, settings, json) {
				if (json) {
					updateTotalBadge(json.recordsFiltered || 0);
				}
			});
		});
	}

	function loadTabelPerkaraJinayatKasasi(kode, tgl_awal = null, tgl_akhir = null) {
		return new Promise((resolve, reject) => {
			const postData = { kode, ...(tgl_awal && tgl_akhir && { tgl_awal, tgl_akhir }) };
			destroyDataTable('#tabelPerkaraJinayatKasasiData');

			$.post('show_jinayat_kasasi', postData)
				.done(function (response) {
					try {
						const data = typeof response === 'string' ? JSON.parse(response) : response;
						const { data_jinayat_kasasi } = data;
						const $container = $('#tabelPerkaraJinayatKasasi').empty();

						if (!data_jinayat_kasasi?.length) {
							$container.html(renderEmptyState('Belum Ada Perkara Jinayat Kasasi, atau belum ada sinkronisasi ke satker daerah.'));
							resolve();
							return;
						}

						const rows = data_jinayat_kasasi.map((row, i) => {
							const tglPermohonan = formatTanggal(row.tanggal_permohonan_kasasi) || '-';
							const tglPutusan = row.tanggal_putusan_kasasi ? formatTanggal(row.tanggal_putusan_kasasi) : '<span class="badge bg-secondary bg-opacity-75">Belum Putus</span>';
							const jenisPutusan = row.jenis_hukuman || '-';
							const jenisPutusanKasasi = badgePutusan(row.status_putusan_kasasi);
							const nama = row.nama_terdakwa || '<span class="text-muted fst-italic">Belum Ada Data</span>';
							const usia = row.usia ? `<span class="badge bg-info bg-opacity-75 text-dark">${row.usia} th</span>` : '<span class="text-muted fst-italic">Belum Ada Data</span>';

							return `
								<tr>
									<td class="text-center align-middle">${i + 1}</td>
									<td class="align-middle"><small class="fw-semibold">${row.nama_satker ?? '-'}</small></td>
									<td class="align-middle"><span class="fw-semibold text-primary">${row.nomor_perkara ?? '-'}</span></td>
									<td class="align-middle">${row.jenis_perkara ?? '-'}</td>
									<td class="text-center align-middle text-nowrap" data-order="${row.tanggal_permohonan_kasasi}">${tglPermohonan}</td>
									<td class="text-center align-middle text-nowrap" data-order="${row.tanggal_putusan_kasasi}">${tglPutusan}</td>
									<td class="align-middle">${jenisPutusan}</td>
									<td class="text-center align-middle">${jenisPutusanKasasi}</td>
									<td class="align-middle"><span>${nama}</span></td>
									<td class="align-middle"><span>${usia}</span></td>
								</tr>
							`;
						}).join('');

						$container.html(`
							<div class="table-responsive">
								<table id="tabelPerkaraJinayatKasasiData" class="table table-striped table-bordered table-hover align-middle" style="width:100%">
									<thead class="table-dark">
										<tr>
											<th class="text-center" style="width:45px">No</th>
											<th>Nama Satker</th>
											<th>Nomor Perkara Tk I</th>
											<th>Jenis Jarimah</th>
											<th class="text-center text-break">Tgl. Permohonan</th>
											<th class="text-center">Tgl. Putusan Kasasi</th>
											<th>Jenis Hukuman Tk I</th>
											<th class="text-center">Status Kasasi</th>
											<th>Terdakwa</th>
											<th>Usia</th>
										</tr>
									</thead>
									<tbody>${rows}</tbody>
									<tfoot class="table-light">
										<tr>
											<th colspan="10" class="text-end pe-3">
												Total Perkara: <span class="badge bg-dark fs-6">${data_jinayat_kasasi.length}</span>
											</th>
										</tr>
									</tfoot>
								</table>
							</div>
						`);

						$('#tabelPerkaraJinayatKasasiData').DataTable(getDataTableConfig({
							order: [[4, 'desc']],
							columnDefs: [
								{ targets: 0, orderable: true, searchable: false, className: 'text-center' },
								{ targets: [4, 5], className: 'text-center' },
								{ targets: 7, className: 'text-center' }
							],
							buttons: [{
								extend: 'excelHtml5',
								text: '<i class="bx bx-spreadsheet me-1"></i> Export Excel',
								title: 'Data Perkara Jinayat Kasasi',
								className: 'btn btn-sm btn-outline-success me-2',
								exportOptions: {
									columns: ':visible',
									format: {
										body: (data) => {
											const temp = document.createElement('div');
											temp.innerHTML = data;
											return temp.textContent || temp.innerText || '';
										}
									}
								}
							}, {
								extend: 'colvis',
								text: '<i class="bx bx-columns me-1"></i> Kolom',
								className: 'btn btn-sm btn-outline-secondary'
							}],
							onInitComplete: resolve
						}));

					} catch (e) {
						console.error('Gagal parsing JSON:', e);
						$('#tabelPerkaraJinayatKasasi').html('<div class="alert alert-danger d-flex align-items-center" role="alert"><i class="bx bx-error-circle fs-4 me-2"></i><div>Gagal memuat data perkara jinayat kasasi. Silakan coba lagi.</div></div>');
						reject(e);
					}
				})
				.fail(reject);
		});
	}

	// ============================================
	// CHART FUNCTIONS
	// ============================================

	function loadChartBebanKerja() {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: 'get_chart_beban_perkara',
				type: 'GET',
				dataType: 'json'
			})
				.done(async function (response) {
					try {
						const options = {
							series: [{
								name: 'Perkara Masuk Tahun Ini',
								data: response.perkara_masuk
							}, {
								name: 'Sisa Perkara Tahun Lalu',
								data: response.sisa_perkara
							}],
							chart: {
								foreColor: '#9ba7b2',
								type: 'bar',
								height: 360
							},
							plotOptions: {
								bar: {
									horizontal: false,
									columnWidth: '55%',
									endingShape: 'rounded'
								}
							},
							dataLabels: { enabled: false },
							stroke: {
								show: true,
								width: 2,
								colors: ['transparent']
							},
							title: {
								text: 'Grafik Beban Kerja Per Satker',
								align: 'left',
								style: { fontSize: '14px' }
							},
							colors: ['#0d6efd', '#ffc107'],
							xaxis: { categories: response.categories },
							yaxis: { title: { text: 'Jumlah Perkara' } },
							fill: { opacity: 1 },
							tooltip: {
								y: {
									formatter: function (val) {
										return val + " Perkara";
									}
								}
							}
						};

						const chart = new ApexCharts(document.querySelector("#grafikBebanKerja"), options);
						await chart.render();
						resolve();
					} catch (err) {
						reject(err);
					}
				})
				.fail(reject);
		});
	}

	function loadPiePerkara(kode_satker) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: 'get_pie_beban_perkara',
				type: "GET",
				data: { kode_satker: kode_satker },
				dataType: "json",
				beforeSend: function () {
					$("#chartBebanKerja").html(`
						<div class="d-flex justify-content-center align-items-center" style="height:330px;">
							<div class="text-center">
								<div class="spinner-border text-primary mb-2"></div>
								<div>Loading chart...</div>
							</div>
						</div>
					`);
				}
			})
				.done(async function (res) {
					$("#chartBebanKerja").html("");

					if (pieChart !== null) {
						pieChart.destroy();
					}

					const options = {
						series: [res.masuk, res.sisa],
						chart: {
							foreColor: '#9ba7b2',
							height: 330,
							type: 'donut'
						},
						colors: ["#0d6efd", "#f41127"],
						labels: ['Perkara Masuk Tahun Ini', 'Sisa Perkara Tahun Lalu'],
						legend: { position: 'bottom' },
						dataLabels: {
							formatter: function (val, opts) {
								return opts.w.config.series[opts.seriesIndex] + " perkara";
							}
						},
						tooltip: {
							y: {
								formatter: function (val) {
									return val + " perkara";
								}
							}
						}
					};

					pieChart = new ApexCharts(document.querySelector("#chartBebanKerja"), options);
					await pieChart.render();
					resolve();
				})
				.fail(reject);
		});
	}

	function loadChartJinayat(kode_satker, tgl_awal = null, tgl_akhir = null) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: 'get_chart_jinayat',
				type: "POST",
				data: { kode_satker: kode_satker, tgl_awal: tgl_awal, tgl_akhir: tgl_akhir },
				dataType: "json",
				beforeSend: function () {
					$("#chartPerkaraJinayat").html("<div class='text-center p-5'>Loading chart...</div>");
				}
			})
				.done(async function (res) {
					$("#chartPerkaraJinayat").html("");

					if (chartJinayat !== null) {
						chartJinayat.destroy();
					}

					let seriesData = [];
					let labelData = [];
					let colorData = [];
					let totalPerkara = 0;

					res.forEach(function (item) {
						const jumlah = Number(item.jumlah) || 0;
						seriesData.push(jumlah);
						labelData.push(item.nama);
						colorData.push(stringToColor(item.jenis_perkara_id));
						totalPerkara += jumlah;
					});

					if (totalPerkara === 0) {
						$("#chartPerkaraJinayat").html("<div class='text-center p-5 text-muted'>Tidak ada data</div>");
						resolve();
						return;
					}

					const options = {
						series: seriesData,
						colors: colorData,
						chart: {
							foreColor: '#9ba7b2',
							height: 350,
							type: 'donut'
						},
						labels: labelData,
						legend: { position: 'bottom' },
						plotOptions: {
							pie: {
								donut: {
									size: '70%',
									labels: {
										show: true,
										name: { show: true, fontSize: '13px' },
										value: {
											show: true,
											fontSize: '18px',
											fontWeight: 600,
											formatter: function (val) {
												return val + " perkara";
											}
										},
										total: {
											show: true,
											label: 'TOTAL PERKARA',
											fontSize: '14px',
											formatter: function () {
												return totalPerkara + " perkara";
											}
										}
									}
								}
							}
						},
						dataLabels: {
							enabled: true,
							formatter: function (val) {
								return val.toFixed(1) + "%";
							}
						},
						tooltip: {
							y: {
								formatter: function (val) {
									return val + " perkara";
								}
							}
						}
					};

					chartJinayat = new ApexCharts(document.querySelector("#chartPerkaraJinayat"), options);
					chartJinayat.render();
					resolve();
				})
				.fail(reject);
		});
	}

	// ============================================
	// NEW: Functions for new data
	// ============================================

	/**
	 * Load Tabel Perkara Banding
	 */
	function loadTabelPerkaraBanding(kode, tgl_awal = null, tgl_akhir = null) {
		// Jika MS Aceh (tingkat banding), tampilkan ringkasan per satker dulu
		if (kode === '401582') {
			loadRingkasanPerkaraBanding();
		} else {
			// Untuk satker lain, load detail langsung (existing behavior)
			loadDetailPerkaraBanding(kode, tgl_awal, tgl_akhir);
		}
	}

	/**
	 * Load Ringkasan Perkara Banding Per Satker (untuk MS Aceh)
	 */
	function loadRingkasanPerkaraBanding() {
		$('#tabelPerkaraBanding').html('<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>');

		$.ajax({
			url: 'halamanutama/get_ringkasan_perkara_banding_per_satker',
			type: 'GET',
			data: { _: Date.now() },
			dataType: 'json',
			cache: false
		})
		.done(function(response) {
			if (response && response.length > 0) {
				const rows = response.map((row, i) => `
					<tr class="satker-row" style="cursor: pointer" data-kode-satker="${row.kode_satker_asal}">
						<td class="text-center">${i + 1}</td>
						<td><span class="fw-semibold">${row.kode_satker_asal}</span></td>
						<td>${row.nama_satker_asal}</td>
						<td class="text-center"><span class="badge bg-primary fs-6">${row.total_perkara_banding}</span></td>
						<td class="text-center"><span class="badge bg-success">${row.sudah_diputus}</span></td>
						<td class="text-center"><span class="badge bg-warning">${row.dalam_proses}</span></td>
						<td class="text-center"><span class="badge bg-danger">${row.dicabut}</span></td>
						<td class="text-center"><span class="badge bg-info text-dark">${Math.round(row.rata_rata_lama_proses)} hari</span></td>
					</tr>
				`).join('');

				const tableHtml = `
					<div class="mb-2">
						<button class="btn btn-sm btn-outline-primary" onclick="loadRingkasanPerkaraBanding()">
							<i class="bx bx-refresh me-1"></i> Refresh Ringkasan
						</button>
					</div>
					<div class="table-responsive">
						<table id="dtRingkasanBanding" class="table table-striped table-bordered table-hover align-middle" style="width:100%">
							<thead class="table-dark">
								<tr>
									<th class="text-center" style="width:45px">No</th>
									<th style="width:80px">Kode</th>
									<th>Satuan Kerja Asal</th>
									<th class="text-center">Total</th>
									<th class="text-center">Sudah Diputus</th>
									<th class="text-center">Dalam Proses</th>
									<th class="text-center">Dicabut</th>
									<th class="text-center">Rata-rata Lama</th>
								</tr>
							</thead>
							<tbody>${rows}</tbody>
							<tfoot class="table-light">
								<tr>
									<th colspan="3" class="text-end pe-3">Total:</th>
									<th class="text-center">${response.reduce((sum, r) => sum + r.total_perkara_banding, 0)}</th>
									<th class="text-center">${response.reduce((sum, r) => sum + r.sudah_diputus, 0)}</th>
									<th class="text-center">${response.reduce((sum, r) => sum + r.dalam_proses, 0)}</th>
									<th class="text-center">${response.reduce((sum, r) => sum + r.dicabut, 0)}</th>
									<th class="text-center">${Math.round(response.reduce((sum, r) => sum + (r.rata_rata_lama_proses * r.total_perkara_banding), 0) / response.reduce((sum, r) => sum + r.total_perkara_banding, 0))} hari</th>
								</tr>
							</tfoot>
						</table>
					</div>
					<small class="text-muted"><i class="bx bx-info-circle"></i> Klik pada baris untuk melihat detail perkara banding</small>
				`;

				$('#tabelPerkaraBanding').html(tableHtml);

				// Initialize DataTable
				$('#dtRingkasanBanding').DataTable(getDataTableConfig({
					order: [[3, 'desc']],
					columnDefs: [
						{ targets: 0, orderable: false, searchable: false, className: 'text-center' },
						{ targets: [3, 4, 5, 6], className: 'text-center' }
					]
				}));

				// Bind click event for table rows
				$('#dtRingkasanBanding').on('click', '.satker-row', function() {
					const satkerKode = $(this).data('kode-satker');
					loadDetailPerkaraBandingBySatker(satkerKode);
				});
			} else {
				$('#tabelPerkaraBanding').html('<div class="alert alert-info">Tidak ada data perkara banding.</div>');
			}
		})
		.fail(function(xhr, status, error) {
			$('#tabelPerkaraBanding').html('<div class="alert alert-danger">Terjadi kesalahan: ' + error + '</div>');
		});
	}

	/**
	 * Load Detail Perkara Banding by Satker Asal
	 */
	function loadDetailPerkaraBandingBySatker(kode_satker_asal) {
		$('#tabelPerkaraBanding').html('<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>');

		$.post('halamanutama/get_detail_perkara_banding_by_satker', {
			kode_satker_asal: kode_satker_asal
		})
		.done(function(response) {
			try {
				const data = typeof response === 'string' ? JSON.parse(response) : response;
				const { data_perkara_banding } = data;

				if (!data_perkara_banding?.length) {
					$('#tabelPerkaraBanding').html('<div class="alert alert-info">Belum ada data detail perkara banding.</div>');
					return;
				}

				const rows = data_perkara_banding.map((row, i) => {
					const tglDaftar = formatTanggal(row.tanggal_pendaftaran_banding);
					const tahunDaftar = row.tahun_pendaftaran ? `<span class="badge bg-info bg-opacity-25 text-dark">${row.tahun_pendaftaran}</span>` : '-';
					const tglPutusan = formatTanggal(row.tanggal_putusan_banding);
					const tahunPutusan = row.tahun_putusan ? `<span class="badge bg-secondary">${row.tahun_putusan}</span>` : '-';

					return `
						<tr>
							<td class="text-center">${i + 1}</td>
							<td>${row.nama_satker_asal ?? '-'}</td>
							<td><span class="fw-semibold text-primary">${row.nomor_perkara_pertama ?? '-'}</span></td>
							<td><span class="fw-semibold text-primary">${row.nomor_perkara_banding || '-'}</span></td>
							<td>${row.jenis_perkara_nama ?? '-'}</td>
							<td data-order="${row.tanggal_pendaftaran_banding || ''}">${tglDaftar}<br><small class="text-muted">${tahunDaftar}</small></td>
							<td data-order="${row.tanggal_putusan_banding || ''}">${tglPutusan}<br><small class="text-muted">${tahunPutusan}</small></td>
							<td>${row.ketua_majelis || '-'}</td>
							<td class="text-center">${badgeStatusProses(row.status_proses)}</td>
							<td class="text-center">${row.lama_proses_hari ?? '-'}</td>
						</tr>
					`;
				}).join('');

				const tableHtml = `
					<div class="mb-2">
						<button id="btnKembaliRingkasan" class="btn btn-sm btn-outline-primary" data-kode-satker="${kode_satker_asal}">
							<i class="bx bx-arrow-back me-1"></i> Kembali ke Ringkasan
						</button>
					</div>
					<div class="mb-2">
						<small class="text-muted"><i class="bx bx-info-circle"></i> Data perkara banding dari tahun 2016 - 2025</small>
					</div>
					<div class="table-responsive">
						<table id="dtPerkaraBanding" class="table table-striped table-bordered table-hover align-middle" style="width:100%">
							<thead class="table-dark">
								<tr>
									<th class="text-center" style="width:45px">No</th>
									<th>Satker Asal</th>
									<th>No. Perkara Pertama</th>
									<th>No. Perkara Banding</th>
									<th>Jenis Perkara</th>
									<th>Tgl. Daftar Banding</th>
									<th>Tgl. Putusan</th>
									<th>Ketua Majelis</th>
									<th class="text-center">Status</th>
									<th class="text-center">Lama (Hari)</th>
								</tr>
							</thead>
							<tbody>${rows}</tbody>
							<tfoot class="table-light">
								<tr>
									<th colspan="10" class="text-end pe-3">
										Total Perkara: <span class="badge bg-dark fs-6">${data_perkara_banding.length}</span>
									</th>
								</tr>
							</tfoot>
						</table>
					</div>
				`;

				$('#tabelPerkaraBanding').html(tableHtml);

				// Bind click event for back button
				$('#btnKembaliRingkasan').on('click', function() {
					loadRingkasanPerkaraBanding();
				});

				// Initialize DataTable
				$('#dtPerkaraBanding').DataTable(getDataTableConfig({
					order: [[6, 'desc']],
					columnDefs: [
						{ targets: 0, orderable: false, searchable: false, className: 'text-center' },
						{ targets: [8, 9], className: 'text-center' }
					]
				}));
			} catch (e) {
				console.error('Gagal parsing JSON:', e);
				$('#tabelPerkaraBanding').html('<div class="alert alert-danger">Gagal memuat data detail perkara banding.</div>');
			}
		})
		.fail(function(xhr, status, error) {
			$('#tabelPerkaraBanding').html('<div class="alert alert-danger">Terjadi kesalahan: ' + error + '</div>');
		});
	}

	/**
	 * Load Detail Perkara Banding (existing function for non-MS Aceh)
	 */
	function loadDetailPerkaraBanding(kode, tgl_awal = null, tgl_akhir = null) {
		$('#tabelPerkaraBanding').html('<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>');

		$.ajax({
			url: 'halamanutama/show_perkara_banding',
			type: 'POST',
			data: {
				kode: kode,
				tgl_awal: tgl_awal,
				tgl_akhir: tgl_akhir
			},
			dataType: 'json'
		})
		.done(function(response) {
			if (response.data_perkara_banding && response.data_perkara_banding.length > 0) {
				const rows = response.data_perkara_banding.map((row, i) => {
					const tglDaftar = formatTanggal(row.tanggal_pendaftaran_banding);
					const tglPutusan = formatTanggal(row.tanggal_putusan_banding);
					const tahunDaftar = row.tahun_pendaftaran ? `<span class="badge bg-info bg-opacity-25 text-dark">${row.tahun_pendaftaran}</span>` : '-';
					const tahunPutusan = row.tahun_putusan ? `<span class="badge bg-secondary">${row.tahun_putusan}</span>` : '-';

					return `
					<tr>
						<td class="text-center">${i + 1}</td>
						<td>${row.nama_satker_asal ?? '-'}</td>
						<td><span class="fw-semibold text-primary">${row.nomor_perkara_pertama ?? '-'}</span></td>
						<td><span class="fw-semibold text-primary">${row.nomor_perkara_banding || '-'}</span></td>
						<td>${row.jenis_perkara_nama ?? '-'}</td>
						<td data-order="${row.tanggal_pendaftaran_banding || ''}">${tglDaftar}<br><small class="text-muted">${tahunDaftar}</small></td>
						<td data-order="${row.tanggal_putusan_banding || ''}">${tglPutusan}<br><small class="text-muted">${tahunPutusan}</small></td>
						<td>${row.ketua_majelis || '-'}</td>
						<td class="text-center">${badgeStatusProses(row.status_proses)}</td>
						<td class="text-center">${row.lama_proses_hari ?? '-'}</td>
					</tr>
				`;
				}).join('');

				const tableHtml = `
					<div class="mb-2">
						<small class="text-muted"><i class="bx bx-info-circle"></i> Data perkara banding dari tahun 2016 - 2025</small>
					</div>
					<div class="table-responsive">
						<table id="dtPerkaraBanding" class="table table-striped table-bordered table-hover align-middle" style="width:100%">
							<thead class="table-dark">
								<tr>
									<th class="text-center" style="width:45px">No</th>
									<th>Satker Asal</th>
									<th>No. Perkara Pertama</th>
									<th>No. Perkara Banding</th>
									<th>Jenis Perkara</th>
									<th>Tgl. Daftar Banding</th>
									<th>Tgl. Putusan</th>
									<th>Ketua Majelis</th>
									<th class="text-center">Status</th>
									<th class="text-center">Lama (Hari)</th>
								</tr>
							</thead>
							<tbody>${rows}</tbody>
							<tfoot class="table-light">
								<tr>
									<th colspan="10" class="text-end pe-3">
										Total Perkara: <span class="badge bg-dark fs-6">${response.data_perkara_banding.length}</span>
									</th>
								</tr>
							</tfoot>
						</table>
					</div>
				`;

				$('#tabelPerkaraBanding').html(tableHtml);

				$('#dtPerkaraBanding').DataTable(getDataTableConfig({
					order: [[6, 'desc']],
					columnDefs: [
						{ targets: 0, orderable: false, searchable: false, className: 'text-center' },
						{ targets: [8, 9], className: 'text-center' }
					]
				}));
			} else {
				$('#tabelPerkaraBanding').html('<div class="alert alert-info">Tidak ada data perkara banding.</div>');
			}
		})
		.fail(function(xhr, status, error) {
			$('#tabelPerkaraBanding').html('<div class="alert alert-danger">Terjadi kesalahan: ' + error + '</div>');
		});
	}

	/**
	 * Load Chart Statistik Kasasi
	 */
	function loadChartStatistikKasasi(kode_satker) {
		$('#containerStatistikKasasi').html('<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>');

		// Jika MS Aceh (tingkat banding), tampilkan tabel ringkasan per satker
		if (kode_satker === '401582') {
			$.ajax({
				url: 'halamanutama/get_ringkasan_kasasi_per_satker',
				type: 'GET',
				data: { _: Date.now() },
				dataType: 'json',
				cache: false
			})
			.done(function(response) {
				if (response && response.length > 0) {
					const rows = response.map((row, i) => `
						<tr class="satker-row" style="cursor: pointer" data-kode-satker="${row.kode_satker}" data-nama-satker="${row.nama_satker}">
							<td class="text-center">${i + 1}</td>
							<td><span class="fw-semibold">${row.kode_satker}</span></td>
							<td>${row.nama_satker}</td>
							<td class="text-center"><span class="badge bg-primary fs-6">${row.total_permohonan}</span></td>
							<td class="text-center"><span class="badge bg-success">${row.dikabulkan}</span></td>
							<td class="text-center"><span class="badge bg-danger">${row.ditolak}</span></td>
							<td class="text-center"><span class="badge bg-warning">${row.dibatalkan}</span></td>
							<td class="text-center"><span class="badge bg-info text-dark">${row.tidak_diterima}</span></td>
							<td class="text-center"><span class="badge bg-secondary">${row.belum_putus}</span></td>
							<td class="text-center"><span class="badge bg-dark">${row.sudah_diputus}</span></td>
						</tr>
					`).join('');

					const tableHtml = `
						<div class="mb-2">
							<button class="btn btn-sm btn-outline-primary" onclick="loadChartStatistikKasasi('401582')">
								<i class="bx bx-arrow-back me-1"></i> Kembali ke Ringkasan
							</button>
						</div>
						<div class="table-responsive">
							<table id="dtRingkasanKasasi" class="table table-striped table-bordered table-hover align-middle" style="width:100%">
								<thead class="table-dark">
									<tr>
										<th class="text-center" style="width:45px">No</th>
										<th style="width:80px">Kode</th>
										<th>Satuan Kerja</th>
										<th class="text-center">Total</th>
										<th class="text-center">Dikabulkan</th>
										<th class="text-center">Ditolak</th>
										<th class="text-center">Dibatalkan</th>
										<th class="text-center">Tidak Diterima</th>
										<th class="text-center">Belum Putus</th>
										<th class="text-center">Sudah Diputus</th>
									</tr>
								</thead>
								<tbody>${rows}</tbody>
								<tfoot class="table-light">
									<tr>
										<th colspan="3" class="text-end pe-3">Total:</th>
										<th class="text-center">${response.reduce((sum, r) => sum + r.total_permohonan, 0)}</th>
										<th class="text-center">${response.reduce((sum, r) => sum + r.dikabulkan, 0)}</th>
										<th class="text-center">${response.reduce((sum, r) => sum + r.ditolak, 0)}</th>
										<th class="text-center">${response.reduce((sum, r) => sum + r.dibatalkan, 0)}</th>
										<th class="text-center">${response.reduce((sum, r) => sum + r.tidak_diterima, 0)}</th>
										<th class="text-center">${response.reduce((sum, r) => sum + r.belum_putus, 0)}</th>
										<th class="text-center">${response.reduce((sum, r) => sum + r.sudah_diputus, 0)}</th>
									</tr>
								</tfoot>
							</table>
						</div>
						<small class="text-muted"><i class="bx bx-info-circle"></i> Klik pada baris untuk melihat detail perkara kasasi</small>
					`;

					$('#containerStatistikKasasi').html(tableHtml);

					// Initialize DataTable
					$('#dtRingkasanKasasi').DataTable(getDataTableConfig({
						order: [[3, 'desc']],
						columnDefs: [
							{ targets: 0, orderable: false, searchable: false, className: 'text-center' },
							{ targets: [3, 4, 5, 6, 7, 8], className: 'text-center' }
						]
					}));

					// Bind click event for table rows
					$('#dtRingkasanKasasi').on('click', '.satker-row', function() {
						const satkerKode = $(this).data('kode-satker');
						loadDetailKasasi(satkerKode, null, '401582'); // Pass MS Aceh as context
					});
				} else {
					$('#containerStatistikKasasi').html('<div class="alert alert-info">Tidak ada data statistik kasasi.</div>');
				}
			})
			.fail(function(xhr, status, error) {
				$('#containerStatistikKasasi').html('<div class="alert alert-danger">Terjadi kesalahan: ' + error + '</div>');
			});
		} else {
			// Untuk satker tingkat pertama, tampilkan chart dengan tombol detail
			$.ajax({
				url: 'halamanutama/get_statistik_kasasi',
				type: 'GET',
				data: { kode_satker: kode_satker, _: Date.now() },
				dataType: 'json',
				cache: false
			})
			.done(function(response) {
				if (response.categories && response.categories.length > 0) {
					const containerHtml = `
						<div class="mb-2 d-flex justify-content-between align-items-center">
							<button id="btnDetailKasasi" class="btn btn-sm btn-outline-primary" data-kode-satker="${kode_satker}">
								<i class="bx bx-list-ul me-1"></i> Lihat Detail Perkara
							</button>
							<small class="text-muted"><i class="bx bx-info-circle"></i> Persentase status perkara kasasi</small>
						</div>
						<div id="chartStatistikKasasi"></div>
					`;
					$('#containerStatistikKasasi').html(containerHtml);

					// Bind click event using jQuery
					$('#btnDetailKasasi').on('click', function() {
						const satkerKode = $(this).data('kode-satker');
						loadDetailKasasi(satkerKode, null);
					});

					// Hitung total untuk setiap kategori
					const totalDikabulkan = response.dikabulkan.reduce((a, b) => a + b, 0);
					const totalDikuatkan = response.dikuatkan ? response.dikuatkan.reduce((a, b) => a + b, 0) : 0;
					const totalDitolak = response.ditolak.reduce((a, b) => a + b, 0);
					const totalDibatalkan = response.dibatalkan.reduce((a, b) => a + b, 0);
					const totalDiperbaiki = response.diperbaiki ? response.diperbaiki.reduce((a, b) => a + b, 0) : 0;
					const totalTidakDiterima = response.tidak_diterima.reduce((a, b) => a + b, 0);
					const totalBelumPutus = response.belum_putus.reduce((a, b) => a + b, 0);

					// Total sudah diputus dari breakdown kategori
					const totalSudahPutusDariStatus = totalDikabulkan + totalDikuatkan + totalDitolak + totalDibatalkan + totalDiperbaiki + totalTidakDiterima;

					// Hitung grand total dari permohonan
					const grandTotal = response.permohonan.reduce((a, b) => a + b, 0);

					// Hitung "Diputus tapi status kosong" - selisih antara grandTotal - belum_putus dengan sum status
					const totalDiputusStatusKosong = grandTotal - totalBelumPutus - totalSudahPutusDariStatus;

					// Filter out categories with 0 value
					const seriesData = [totalDikabulkan, totalDikuatkan, totalDitolak, totalDibatalkan, totalDiperbaiki, totalTidakDiterima, totalDiputusStatusKosong, totalBelumPutus];
					const labelsData = ['Dikabulkan', 'Dikuatkan', 'Ditolak', 'Dibatalkan', 'Diperbaiki', 'Tidak Diterima', 'Diputus (Status Kosong)', 'Belum Putus'];
					const colorsData = ['#2ecc71', '#00bc8c', '#e74c3c', '#f39c12', '#9b59b6', '#3498db', '#6c757d', '#95a5a6'];

					// Create arrays with only non-zero values
					const filteredSeries = [];
					const filteredLabels = [];
					const filteredColors = [];

					seriesData.forEach((val, idx) => {
						if (val > 0) {
							filteredSeries.push(val);
							filteredLabels.push(labelsData[idx]);
							filteredColors.push(colorsData[idx]);
						}
					});

					// Donut chart options
					const options = {
						series: filteredSeries,
						chart: {
							type: 'donut',
							height: 350,
							foreColor: '#9ba7b2',
							toolbar: { show: false }
						},
						labels: filteredLabels,
						colors: filteredColors,
						legend: { position: 'bottom' },
						plotOptions: {
							pie: {
								donut: {
									size: '70%',
									labels: {
										show: true,
										name: { show: true, fontSize: '13px' },
										value: {
											show: true,
											fontSize: '18px',
											fontWeight: 600,
											formatter: function (val) {
												return val + " perkara";
											}
										},
										total: {
											show: true,
											label: 'TOTAL PERKARA',
											fontSize: '14px',
											formatter: function () {
												return grandTotal + " perkara";
											}
										}
									}
								}
							}
						},
						dataLabels: {
							enabled: true,
							formatter: function (val) {
								return val.toFixed(1) + "%";
							}
						},
						tooltip: {
							y: {
								formatter: function (val) {
									return val + " perkara (" + (val / grandTotal * 100).toFixed(1) + "%)";
								}
							}
						}
					};

					let chart = new ApexCharts(document.querySelector("#chartStatistikKasasi"), options);
					chart.render();
				} else {
					$('#containerStatistikKasasi').html('<div class="alert alert-info">Tidak ada data statistik kasasi.</div>');
				}
			})
			.fail(function(xhr, status, error) {
				$('#containerStatistikKasasi').html('<div class="alert alert-danger">Terjadi kesalahan: ' + error + '</div>');
			});
		}
	}

	/**
	 * Load Detail Perkara Kasasi (tabel per perkara)
	 * @param {string} kode_satker - Kode satker
	 * @param {string|null} periode_bulan - Periode bulan filter
	 * @param {string} parent_context - Parent view context (e.g., '401582' for MS Aceh summary)
	 */
	function loadDetailKasasi(kode_satker, periode_bulan = null, parent_context = null) {
		$('#containerStatistikKasasi').html('<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>');

		$.post('halamanutama/get_detail_statistik_kasasi', {
			kode_satker: kode_satker,
			periode_bulan: periode_bulan
		})
		.done(function(response) {
			try {
				// Response might already be parsed by jQuery if Content-Type is application/json
				const data = typeof response === 'string' ? JSON.parse(response) : response;
				const { data_detail_kasasi } = data;

				if (!data_detail_kasasi?.length) {
					$('#containerStatistikKasasi').html('<div class="alert alert-info">Belum ada data detail perkara kasasi.</div>');
					return;
				}

				const rows = data_detail_kasasi.map((row, i) => {
					const tglPermohonan = formatTanggal(row.tanggal_permohonan_kasasi) || '-';
					const tahunPermohonan = row.tahun_permohonan ? `<span class="badge bg-info bg-opacity-25 text-dark">${row.tahun_permohonan}</span>` : '-';
					const tglPutusan = row.tanggal_putusan_kasasi ? formatTanggal(row.tanggal_putusan_kasasi) : '<span class="badge bg-secondary">Belum Putus</span>';
					const tahunPutusan = row.tahun_putusan ? `<span class="badge bg-secondary">${row.tahun_putusan}</span>` : '-';
					const statusBadge = badgeStatusKasasi(row.status_putusan_label);
					const nama = row.nama_terdakwa || '<span class="text-muted fst-italic">-</span>';
					const usia = row.usia ? `<span class="badge bg-info bg-opacity-75 text-dark">${row.usia} th</span>` : '-';
					const lamaProses = row.lama_proses_hari ? `<span class="badge bg-light text-dark">${row.lama_proses_hari} hari</span>` : '-';

					return `
						<tr>
							<td class="text-center">${i + 1}</td>
							<td><small class="fw-semibold">${row.nama_satker ?? '-'}</small></td>
							<td><span class="fw-semibold text-primary">${row.nomor_perkara ?? '-'}</span></td>
							<td><span class="fw-semibold text-warning">${row.nomor_perkara_kasasi ?? '-'}</span></td>
							<td>${row.jenis_perkara ?? '-'}</td>
							<td class="text-center text-nowrap" data-order="${row.tanggal_permohonan_kasasi || ''}">${tglPermohonan}<br><small class="text-muted">${tahunPermohonan}</small></td>
							<td class="text-center text-nowrap" data-order="${row.tanggal_putusan_kasasi || ''}">${tglPutusan}<br><small class="text-muted">${tahunPutusan}</small></td>
							<td class="text-center">${statusBadge}</td>
							<td>${nama}</td>
							<td class="text-center">${usia}</td>
							<td class="text-center">${lamaProses}</td>
						</tr>
					`;
				}).join('');

				// Determine back button text and target based on context
				const isFromMsAceh = parent_context === '401582';
				const backButtonText = isFromMsAceh ? 'Kembali ke Ringkasan' : 'Kembali ke Chart';

				const tableHtml = `
					<div class="mb-2">
						<button id="btnKembaliChart" class="btn btn-sm btn-outline-primary" data-kode-satker="${kode_satker}" data-parent-context="${parent_context || ''}">
							<i class="bx bx-arrow-back me-1"></i> ${backButtonText}
						</button>
					</div>
					<div class="mb-2">
						<small class="text-muted"><i class="bx bx-info-circle"></i> Data perkara kasasi dari tahun 2017 - 2025</small>
					</div>
					<div class="table-responsive">
						<table id="dtDetailKasasi" class="table table-striped table-bordered table-hover align-middle" style="width:100%">
							<thead class="table-dark">
								<tr>
									<th class="text-center" style="width:45px">No</th>
									<th>Satker</th>
									<th>Nomor Perkara Tk I</th>
									<th>Nomor Kasasi</th>
									<th>Jenis Jarimah</th>
									<th class="text-center">Tgl. Permohonan</th>
									<th class="text-center">Tgl. Putusan</th>
									<th class="text-center">Status</th>
									<th>Terdakwa</th>
									<th class="text-center">Usia</th>
									<th class="text-center">Lama Proses</th>
								</tr>
							</thead>
							<tbody>${rows}</tbody>
							<tfoot class="table-light">
								<tr>
									<th colspan="10" class="text-end pe-3">
										Total Perkara: <span class="badge bg-dark fs-6">${data_detail_kasasi.length}</span>
									</th>
								</tr>
							</tfoot>
						</table>
					</div>
				`;

				$('#containerStatistikKasasi').html(tableHtml);

				// Bind click event for back button
				$('#btnKembaliChart').on('click', function() {
					const satkerKode = $(this).data('kode-satker');
					const parentCtx = $(this).attr('data-parent-context'); // Use attr() to get raw string value

					// If came from MS Aceh summary, return to MS Aceh summary
					if (parentCtx === '401582') {
						loadChartStatistikKasasi('401582');
					} else {
						// Otherwise return to the satker's chart
						loadChartStatistikKasasi(satkerKode);
					}
				});

				// Initialize DataTable
				$('#dtDetailKasasi').DataTable(getDataTableConfig({
					order: [[5, 'desc']],
					columnDefs: [
						{ targets: 0, orderable: false, searchable: false, className: 'text-center' },
						{ targets: [5, 6, 8, 9], className: 'text-center' }
					],
					buttons: [{
						extend: 'excelHtml5',
						text: '<i class="bx bx-spreadsheet me-1"></i> Export Excel',
						title: 'Detail Perkara Kasasi',
						className: 'btn btn-sm btn-outline-success me-2',
						exportOptions: {
							columns: ':visible',
							format: {
								body: (data) => {
									const temp = document.createElement('div');
									temp.innerHTML = data;
									return temp.textContent || temp.innerText || '';
								}
							}
						}
					}, {
						extend: 'colvis',
						text: '<i class="bx bx-columns me-1"></i> Kolom',
						className: 'btn btn-sm btn-outline-secondary'
					}]
				}));
			} catch (e) {
				console.error('Gagal parsing JSON:', e);
				$('#containerStatistikKasasi').html('<div class="alert alert-danger">Gagal memuat data detail perkara kasasi.</div>');
			}
		})
		.fail(function(xhr) {
			$('#containerStatistikKasasi').html('<div class="alert alert-danger">Gagal memuat data detail perkara kasasi.</div>');
		});
	}

	/**
	 * Load Detail Kasasi dari tabel ringkasan (untuk MS Aceh)
	 */
	function loadDetailKasasiFromTable(kode_satker, nama_satker) {
		loadDetailKasasi(kode_satker, null);
	}

	/**
	 * Badge Status Kasasi
	 */
	function badgeStatusKasasi(status) {
		const badges = {
			'Dikabulkan': 'bg-success',
			'Diperbaiki': 'bg-success',
			'Dikuatkan': 'bg-success',
			'Ditolak': 'bg-danger',
			'Dibatalkan': 'bg-warning',
			'Tidak Diterima': 'bg-info text-dark',
			'Belum Putus': 'bg-secondary'
		};
		const badgeClass = badges[status] || 'bg-secondary';
		return `<span class="badge ${badgeClass}">${status}</span>`;
	}

	/**
	 * Load Tabel Status Sinkronisasi
	 */
	function loadTabelSinkronisasi() {
		$('#tabelSinkronisasi').html('<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>');

		$.ajax({
			url: 'halamanutama/get_sinkronisasi_status',
			type: 'GET',
			dataType: 'json'
		})
		.done(function(response) {
			if (response && response.length > 0) {
				const rows = response.map((row, i) => `
					<tr>
						<td class="text-center">${i + 1}</td>
						<td><span class="fw-semibold">${row.kode_satker}</span></td>
						<td>${row.nama_satker}</td>
						<td>${row.kota || '-'}</td>
						<td class="text-center">${badgeStatusSinkronisasi(row.status_sinkronisasi)}</td>
						<td class="text-center">${row.selisih_hari !== null ? row.selisih_hari + ' hari' : '-'}</td>
						<td>${formatTanggal(row.last_sync)}</td>
					</tr>
				`).join('');

				const tableHtml = `
					<div class="table-responsive">
						<table id="dtSinkronisasi" class="table table-striped table-bordered table-hover align-middle" style="width:100%">
							<thead class="table-dark">
								<tr>
									<th class="text-center" style="width:45px">No</th>
									<th>Kode</th>
									<th>Satker</th>
									<th>Kota</th>
									<th class="text-center">Status</th>
									<th class="text-center">Selisih Hari</th>
									<th>Last Sync</th>
								</tr>
							</thead>
							<tbody>${rows}</tbody>
							<tfoot class="table-light">
								<tr>
									<th colspan="7" class="text-end pe-3">
										Total Satker: <span class="badge bg-dark fs-6">${response.length}</span>
									</th>
								</tr>
							</tfoot>
						</table>
					</div>
				`;

				$('#tabelSinkronisasi').html(tableHtml);

				$('#dtSinkronisasi').DataTable(getDataTableConfig({
					order: [[6, 'desc']],
					columnDefs: [
						{ targets: 0, orderable: false, searchable: false, className: 'text-center' },
						{ targets: [4, 5], className: 'text-center' }
					]
				}));
			} else {
				$('#tabelSinkronisasi').html('<div class="alert alert-info">Tidak ada data sinkronisasi.</div>');
			}
		})
		.fail(function(xhr, status, error) {
			$('#tabelSinkronisasi').html('<div class="alert alert-danger">Terjadi kesalahan: ' + error + '</div>');
		});
	}

	/**
	 * Badge Status Proses
	 */
	function badgeStatusProses(status) {
		if (status === 'Diputus') {
			return '<span class="badge bg-success">Diputus</span>';
		} else if (status === 'Dicabut') {
			return '<span class="badge bg-danger">Dicabut</span>';
		} else if (status === 'Dalam Proses') {
			return '<span class="badge bg-warning">Dalam Proses</span>';
		}
		return '<span class="badge bg-secondary">' + status + '</span>';
	}

	/**
	 * Badge Status Sinkronisasi
	 */
	function badgeStatusSinkronisasi(status) {
		if (status === 'Aktif') {
			return '<span class="badge bg-success">Aktif</span>';
		} else if (status === 'Lama') {
			return '<span class="badge bg-warning">Lama</span>';
		} else if (status === 'Offline') {
			return '<span class="badge bg-danger">Offline</span>';
		}
		return '<span class="badge bg-secondary">' + status + '</span>';
	}

	// ============================================
	// EVENT HANDLERS
	// ============================================

	$(function () {
		// Search bar
		$(".mobile-search-icon").on("click", function () {
			$(".search-bar").addClass("full-search-bar");
		});
		$(".search-close").on("click", function () {
			$(".search-bar").removeClass("full-search-bar");
		});
		$(".mobile-toggle-menu").on("click", function () {
			$wrapper.addClass("toggled");
		});

		// Toggle menu button
		$(".toggle-icon").on("click", function () {
			if ($wrapper.hasClass("toggled")) {
				$wrapper.removeClass("toggled");
				$sidebarWrapper.off("mouseenter mouseleave");
			} else {
				$wrapper.addClass("toggled");
				$sidebarWrapper.on("mouseenter", function () {
					$wrapper.addClass("sidebar-hovered");
				}).on("mouseleave", function () {
					$wrapper.removeClass("sidebar-hovered");
				});
			}
		});

		// Back To Top - dengan throttling untuk performa lebih baik
		const handleScroll = throttle(function () {
			if ($window.scrollTop() > 300) {
				$backToTop.fadeIn();
			} else {
				$backToTop.fadeOut();
			}
		}, 100);

		$window.on("scroll", handleScroll);
		$backToTop.on("click", function () {
			$("html, body").animate({ scrollTop: 0 }, 600);
			return false;
		});

		// Metismenu
		$(function () {
			for (var i = window.location, o = $(".metismenu li a").filter(function () {
				return this.href == i;
			}).addClass("").parent().addClass(""); ;) {
				if (!o.is("li")) break;
				o = o.parent("").addClass("").parent("").addClass("");
			}
		});
		$('#menu').metisMenu();

		// Chat toggle
		$(".chat-toggle-btn").on("click", function () {
			$(".chat-wrapper").toggleClass("chat-toggled");
		});
		$(".chat-toggle-btn-mobile").on("click", function () {
			$(".chat-wrapper").removeClass("chat-toggled");
		});

		// Email toggle
		$(".email-toggle-btn").on("click", function () {
			$(".email-wrapper").toggleClass("email-toggled");
		});
		$(".email-toggle-btn-mobile").on("click", function () {
			$(".email-wrapper").removeClass("email-toggled");
		});

		// Compose mail
		$(".compose-mail-btn").on("click", function () {
			$(".compose-mail-popup").show();
		});
		$(".compose-mail-close").on("click", function () {
			$(".compose-mail-popup").hide();
		});

		// Switcher
		$(".switcher-btn").on("click", function () {
			$(".switcher-wrapper").toggleClass("switcher-toggled");
		});
		$(".close-switcher").on("click", function () {
			$(".switcher-wrapper").removeClass("switcher-toggled");
		});

		// Initialize date range picker and tooltips
		initDateRangePicker();

		// Theme switcher
		$("#lightmode").on("click", function () {
			$html.attr('class', 'light-theme');
		});
		$("#darkmode").on("click", function () {
			$html.attr('class', 'dark-theme');
		});
		$("#semidark").on("click", function () {
			$html.attr('class', 'semi-dark');
		});
		$("#minimaltheme").on("click", function () {
			$html.attr('class', 'minimal-theme');
		});

		// Header color switcher - optimized dengan loop
		HEADER_COLORS.forEach((color, index) => {
			$(`#${color}`).on("click", function () {
				$html.addClass(`color-header ${color}`);
				HEADER_COLORS.forEach(c => {
					if (c !== color) {
						$html.removeClass(c);
					}
				});
			});
		});
	});

	// Expose functions ke global scope untuk digunakan di HTML
	window.getSatker = getSatker;
	window.setFilter = setFilter;
	window.formatDate = formatDate;
	window.loadChartBebanKerja = loadChartBebanKerja;
	window.loadDashboardPerkara = loadDashboardPerkara;
	window.loadKpiSummary = loadKpiSummary;
	window.loadChartStatistikKasasi = loadChartStatistikKasasi;
	window.loadDetailKasasi = loadDetailKasasi;
	window.loadDetailKasasiFromTable = loadDetailKasasiFromTable;

})(jQuery);
