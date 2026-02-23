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
		loadDashboardPerkara(select.value);
	}

	function setFilter() {
		const satker = document.getElementById('satker')?.value;
		if (satker) {
			loadDashboardPerkara(satker);
		}
	}

	async function loadDashboardPerkara(kode) {
		const tgl_awal = document.getElementById('tgl_awal')?.value || null;
		const tgl_akhir = document.getElementById('tgl_akhir')?.value || null;
		const useFilter = tgl_awal && tgl_akhir;
		const params = useFilter ? [kode, tgl_awal, tgl_akhir] : [kode];

		showLoading("Menyiapkan dashboard...");

		try {
			const requests = [
				loadPiePerkara(kode),
				loadTabelEksekusi(...params),
				loadTabelEksekusiHT(...params),
				loadTabelPerkaraJinayat(...params),
				loadTabelPerkaraJinayatKasasi(...params),
				loadChartJinayat(...params)
			];

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
						const { data_eksekusi } = JSON.parse(response);
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
						const { data_eksekusi_ht } = JSON.parse(response);
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
						updateTotalBadge(json.recordsFiltered || json.recordsTotal || 0);
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
					updateTotalBadge(json.recordsFiltered || json.recordsTotal || 0);
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
						const { data_jinayat_kasasi } = JSON.parse(response);
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

})(jQuery);
